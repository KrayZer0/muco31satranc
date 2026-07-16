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

    // ÖNEMLİ: Bu motor derlemesi .wasm dosyasını düz, göreceli bir metin
    // sabiti olarak ("stockfish.wasm") arıyor; Module.locateFile/instantiateWasm
    // kancalarını dinlemiyor. Bunu kesin çözmek için kaynak kodun İÇİNDEKİ
    // bu metni, çalışmadan önce, doğrudan tam CDN adresiyle değiştiriyoruz.
    const engineCode = rawCode.replace(/(['"])stockfish\.wasm\1/g, `$1${wasmUrl}$1`);

    // Ek güvenlik: klasik Module kancalarını da tanımlayalım (zararı olmaz,
    // bu derleme kullanmasa bile başka bir derleme kullanabilir).
    const prefix = `
      var Module = (typeof Module !== 'undefined') ? Module : {};
      Module.locateFile = function (path) {
        return path.indexOf('http') === 0 ? path : '${STOCKFISH_BASE_URL}' + path;
      };
    `;

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
        reject(err);
      });
      worker.postMessage('uci');
    });

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
function analyzeFenWithStockfish(fen, movetimeMs) {
  return new Promise((resolve, reject) => {
    if (!sfWorker) { reject(new Error('Motor hazır değil.')); return; }

    let lastScore = { evalCp: 0, mateIn: null };
    let stopped = false;

    // Motor movetime'a tam uymazsa, yine de zorla durdurmayı deneriz.
    const stopTimer = setTimeout(() => {
      stopped = true;
      sfWorker.postMessage('stop');
    }, movetimeMs + 2000);

    const hardTimeout = setTimeout(() => {
      sfWorker.removeEventListener('message', onMsg);
      reject(new Error('Analiz zaman aşımına uğradı.'));
    }, movetimeMs + 8000);

    function onMsg(e) {
      const line = typeof e.data === 'string' ? e.data : '';
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
