/* ============================================================
   stockfish-engine.js — CDN üzerinden Stockfish WASM motorunu
   yükleyip UCI protokolüyle konuşan sarmalayıcı.

   Notlar:
   - GitHub Pages gibi statik barındırmalarda özel sunucu başlığı
     (COOP/COEP) ayarlanamadığından çok-iş-parçacıklı (multi-thread)
     WASM yerine tek-iş-parçacıklı bir sürüm kullanıyoruz.
   - Worker'lar farklı kökenden (cross-origin) doğrudan
     oluşturulamadığı için motor kodunu fetch edip bir Blob'a
     sarıp öyle Worker'a çeviriyoruz. Aynı sebeple .wasm dosyasının
     nereden yükleneceğini (Module.locateFile) elle belirtiyoruz.
   ============================================================ */

const STOCKFISH_BASE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/';
const STOCKFISH_ENGINE_FILE = 'stockfish.wasm.js';

let sfWorker = null;
let sfReadyPromise = null;

function isWasmSupported() {
  try {
    return typeof WebAssembly === 'object' &&
      WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
  } catch (e) {
    return false;
  }
}

function loadStockfish() {
  if (sfReadyPromise) return sfReadyPromise;

  sfReadyPromise = (async () => {
    if (!isWasmSupported()) throw new Error('Bu tarayıcı WebAssembly desteklemiyor.');
    if (typeof Worker === 'undefined') throw new Error('Bu tarayıcı Web Worker desteklemiyor.');

    const engineUrl = STOCKFISH_BASE_URL + STOCKFISH_ENGINE_FILE;
    const wasmUrl = STOCKFISH_BASE_URL + 'stockfish.wasm';

    const res = await fetch(engineUrl);
    if (!res.ok) throw new Error('Motor dosyası indirilemedi: HTTP ' + res.status);
    const rawCode = await res.text();

    // ÖNEMLİ: Bu motor derlemesi .wasm dosyasını göreceli bir yoldan
    // ("stockfish.wasm") yüklemeye çalışıyor; bu bir Blob worker
    // içinde çözülemiyor. Kaynak kodun kendisini tahmin etmeye
    // çalışmak yerine, worker'ın kendi fetch/XHR fonksiyonlarını ele
    // geçirip HER göreceli adresi otomatik olarak tam CDN adresine
    // çeviriyoruz — bu, motorun bu isteği nasıl oluşturduğundan
    // bağımsız, kesin çalışan bir yöntemdir.
    const prefix = `
      var Module = (typeof Module !== 'undefined') ? Module : {};
      Module.locateFile = function (path) {
        return path.indexOf('http') === 0 ? path : '${STOCKFISH_BASE_URL}' + path;
      };
      (function () {
        function resolveUrl(u) {
          if (typeof u === 'string' && u.indexOf('http') !== 0 && u.indexOf('blob:') !== 0) {
            return '${STOCKFISH_BASE_URL}' + u.replace(/^\\.?\\/?/, '');
          }
          return u;
        }
        var _origFetch = self.fetch ? self.fetch.bind(self) : null;
        if (_origFetch) {
          self.fetch = function (input, init) {
            if (typeof input === 'string') input = resolveUrl(input);
            return _origFetch(input, init);
          };
        }
        var _origOpen = self.XMLHttpRequest ? self.XMLHttpRequest.prototype.open : null;
        if (_origOpen) {
          self.XMLHttpRequest.prototype.open = function (method, url) {
            var args = Array.prototype.slice.call(arguments);
            args[1] = resolveUrl(url);
            return _origOpen.apply(this, args);
          };
        }
        var _origImportScripts = self.importScripts;
        if (_origImportScripts) {
          self.importScripts = function () {
            var args = Array.prototype.slice.call(arguments).map(resolveUrl);
            return _origImportScripts.apply(self, args);
          };
        }
      })();
    `;

    const engineCode = rawCode.replace(/(['"])stockfish\.wasm\1/g, `$1${wasmUrl}$1`);

    const blob = new Blob([prefix + engineCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    const worker = new Worker(blobUrl);

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Motor başlatma zaman aşımına uğradı (uciok gelmedi).'));
      }, 12000);

      function onMsg(e) {
        const line = typeof e.data === 'string' ? e.data : '';
        if (SF_DEBUG && line) console.log('[SF:handshake]', line);
        if (line === 'uciok') {
          worker.postMessage('isready');
        } else if (line === 'readyok') {
          clearTimeout(timeout);
          worker.removeEventListener('message', onMsg);
          resolve();
        }
      }
      worker.addEventListener('message', onMsg);
      worker.addEventListener('error', (err) => {
        clearTimeout(timeout);
        console.error('[müco31] Stockfish worker (yükleme sırasında) hata verdi:', err.message || err);
        reject(err);
      });
      worker.postMessage('uci');
    });

    if (SF_DEBUG) console.log('[müco31] Stockfish motoru başarıyla yüklendi ve hazır.');

    worker.postMessage('ucinewgame');
    sfWorker = worker;
    return worker;
  })();

  return sfReadyPromise;
}

/**
 * Verilen FEN pozisyonunu belirli bir süre (ms) boyunca analiz eder.
 * "go depth N" yerine "go movetime N" kullanıyoruz çünkü bu, motorun
 * kesin olarak ne zaman cevap vermesi gerektiğini garanti eder — bazı
 * motor derlemeleri "depth" limitini güvenilir şekilde desteklemiyor.
 * Sonuç, o pozisyonda sırası gelen tarafın perspektifinden bir
 * centipawn değeri (evalCp) ve varsa mat sayısı (mateIn) döndürür.
 */
let SF_DEBUG = true; // sorun devam ederse konsolda ham motor çıktısını görebilmek için

function analyzeFenWithStockfish(fen, movetimeMs) {
  return new Promise((resolve, reject) => {
    if (!sfWorker) { reject(new Error('Motor hazır değil.')); return; }

    let lastScore = { evalCp: 0, mateIn: null };

    // Motor movetime'a tam uymazsa, yine de zorla durdurmayı deneriz.
    const stopTimer = setTimeout(() => {
      sfWorker.postMessage('stop');
    }, movetimeMs + 2000);

    const hardTimeout = setTimeout(() => {
      sfWorker.removeEventListener('message', onMsg);
      sfWorker.removeEventListener('error', onErr);
      reject(new Error('Analiz zaman aşımına uğradı.'));
    }, movetimeMs + 8000);

    function onErr(err) {
      clearTimeout(stopTimer);
      clearTimeout(hardTimeout);
      sfWorker.removeEventListener('message', onMsg);
      sfWorker.removeEventListener('error', onErr);
      console.error('[müco31] Stockfish worker hata verdi:', err.message || err);
      reject(new Error('Motor çalışırken hata oluştu: ' + (err.message || 'bilinmiyor')));
    }

    function onMsg(e) {
      const line = typeof e.data === 'string' ? e.data : '';
      if (SF_DEBUG && line) console.log('[SF]', line);
      if (line.indexOf('info') === 0 && line.indexOf('score') !== -1) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        if (mateMatch) {
          lastScore = { evalCp: null, mateIn: parseInt(mateMatch[1], 10) };
        } else if (cpMatch) {
          lastScore = { evalCp: parseInt(cpMatch[1], 10), mateIn: null };
        }
      }
      if (line.indexOf('bestmove') === 0) {
        clearTimeout(stopTimer);
        clearTimeout(hardTimeout);
        sfWorker.removeEventListener('message', onMsg);
        sfWorker.removeEventListener('error', onErr);
        const parts = line.split(' ');
        const bestMoveUci = parts[1] && parts[1] !== '(none)' ? parts[1] : null;
        let evalCp = lastScore.evalCp;
        if (evalCp === null && lastScore.mateIn !== null) {
          const sign = lastScore.mateIn > 0 ? 1 : -1;
          evalCp = sign * (10000 - Math.abs(lastScore.mateIn) * 10);
        }
        resolve({ evalCp: evalCp === null ? 0 : evalCp, mateIn: lastScore.mateIn, bestMoveUci });
      }
    }

    sfWorker.addEventListener('message', onMsg);
    sfWorker.addEventListener('error', onErr);
    if (SF_DEBUG) console.log('[SF:gönder]', 'position fen ' + fen, '| go movetime ' + movetimeMs);
    sfWorker.postMessage('position fen ' + fen);
    sfWorker.postMessage('go movetime ' + movetimeMs);
  });
}

function uciToMoveDescriptor(uci) {
  if (!uci || uci.length < 4) return null;
  const from = algebraicToSquare(uci.slice(0, 2));
  const to = algebraicToSquare(uci.slice(2, 4));
  const descriptor = { r1: from.r, c1: from.c, r2: to.r, c2: to.c };
  if (uci.length > 4) descriptor.promotion = uci[4].toUpperCase();
  return descriptor;
}
