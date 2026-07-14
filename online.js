/* ============================================================
   online.js — Firebase Realtime Database ile çevrimiçi oyun
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCtbACKSNDlZ-HcoNYvd67lkaa3ygbHmRw",
  authDomain: "muco31satranc.firebaseapp.com",
  databaseURL: "https://muco31satranc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "muco31satranc",
  storageBucket: "muco31satranc.firebasestorage.app",
  messagingSenderId: "292494400655",
  appId: "1:292494400655:web:fb9071043300c5fe1464fa",
};

let fbApp = null;
let fbDb = null;

function initFirebase() {
  if (fbDb) return true;
  if (typeof firebase === 'undefined') {
    console.error('[müco31] Firebase SDK yüklenemedi (ağ bağlantısı veya reklam engelleyici olabilir).');
    return false;
  }
  try {
    fbApp = firebase.initializeApp(firebaseConfig);
    fbDb = firebase.database();
    return true;
  } catch (err) {
    console.error('[müco31] Firebase başlatılamadı:', err);
    return false;
  }
}

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode(length = 5) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

let onlineState = null;

function resetOnlineLocalState() {
  onlineState = {
    roomCode: null,
    color: null,
    movesRef: null,
    playersRef: null,
    gameState: freshState(),
    sanHistory: [],
    moveDescriptors: [],
    capturedByColor: { w: [], b: [] },
    lastMove: null,
    selected: null,
    legalForSelected: [],
    gameOver: false,
    result: null,
    opponentPresent: false,
  };
}
resetOnlineLocalState();

/* ---------- Lobby / view helpers ---------- */

function showOnlineError(msg) {
  const el = document.getElementById('onlineError');
  if (el) el.textContent = msg || '';
}

function showOnlineLobby() {
  document.getElementById('onlineLobby').hidden = false;
  document.getElementById('onlineWaiting').hidden = true;
  document.getElementById('onlineGameArea').hidden = true;
  document.getElementById('onlineAnalysis').hidden = true;
  showOnlineError('');
  const input = document.getElementById('joinRoomInput');
  if (input) input.value = '';
}

function enterWaitingRoom(code) {
  document.getElementById('onlineLobby').hidden = true;
  document.getElementById('onlineWaiting').hidden = false;
  document.getElementById('onlineGameArea').hidden = true;
  document.getElementById('roomCodeDisplay').textContent = code;
}

function enterGameRoom(code) {
  document.getElementById('onlineLobby').hidden = true;
  document.getElementById('onlineWaiting').hidden = true;
  document.getElementById('onlineGameArea').hidden = false;
  document.getElementById('onlineRoomLabel').textContent = code;
  document.getElementById('onlineYourColor').textContent = onlineState.color === 'w' ? 'Beyaz' : 'Siyah';
  renderOnlineBoard();
}

function leaveOnlineRoom() {
  if (onlineState.playersRef) onlineState.playersRef.off();
  if (onlineState.movesRef) onlineState.movesRef.off();
  resetOnlineLocalState();
  showOnlineLobby();
}

/* ---------- Room actions ---------- */

on('createRoomBtn', 'click', async () => {
  showOnlineError('');
  if (!initFirebase()) {
    showOnlineError('Bağlantı kurulamadı. İnternetini ve reklam engelleyici ayarlarını kontrol et.');
    return;
  }

  const code = generateRoomCode();
  resetOnlineLocalState();
  onlineState.roomCode = code;
  onlineState.color = 'w';

  try {
    await fbDb.ref('rooms/' + code).set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      players: { w: true },
    });
    enterWaitingRoom(code);
    subscribeToRoom(code);
  } catch (err) {
    console.error(err);
    showOnlineError('Oda oluşturulamadı, tekrar dene.');
  }
});

on('joinRoomBtn', 'click', async () => {
  showOnlineError('');
  if (!initFirebase()) {
    showOnlineError('Bağlantı kurulamadı. İnternetini ve reklam engelleyici ayarlarını kontrol et.');
    return;
  }

  const input = document.getElementById('joinRoomInput');
  const code = (input.value || '').trim().toUpperCase();
  if (!code) {
    showOnlineError('Bir oda kodu gir.');
    return;
  }

  try {
    const snap = await fbDb.ref('rooms/' + code).once('value');
    if (!snap.exists()) {
      showOnlineError('Böyle bir oda bulunamadı. Kodu kontrol et.');
      return;
    }
    const room = snap.val();
    if (room.players && room.players.b) {
      showOnlineError('Bu oda zaten dolu.');
      return;
    }

    resetOnlineLocalState();
    onlineState.roomCode = code;
    onlineState.color = 'b';

    await fbDb.ref('rooms/' + code + '/players/b').set(true);
    enterGameRoom(code);
    subscribeToRoom(code);
  } catch (err) {
    console.error(err);
    showOnlineError('Odaya katılırken bir sorun oluştu, tekrar dene.');
  }
});

on('copyRoomCodeBtn', 'click', () => {
  if (!onlineState.roomCode) return;
  const btn = document.getElementById('copyRoomCodeBtn');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(onlineState.roomCode).then(() => {
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = 'Kopyalandı!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    }).catch(() => {});
  }
});

on('cancelWaitingBtn', 'click', () => {
  leaveOnlineRoom();
});

on('leaveRoomBtn', 'click', () => {
  leaveOnlineRoom();
});

/* ---------- Realtime sync ---------- */

function subscribeToRoom(code) {
  const roomRef = fbDb.ref('rooms/' + code);
  onlineState.playersRef = roomRef.child('players');
  onlineState.movesRef = roomRef.child('moves');

  onlineState.playersRef.on('value', (snap) => {
    if (!onlineState || onlineState.roomCode !== code) return;
    const players = snap.val() || {};
    onlineState.opponentPresent = onlineState.color === 'w' ? !!players.b : !!players.w;

    const waitingVisible = document.getElementById('onlineWaiting').hidden === false;
    if (onlineState.opponentPresent && waitingVisible) {
      enterGameRoom(code);
    }
    updateOnlineStatusText();
  });

  onlineState.movesRef.on('value', (snap) => {
    if (!onlineState || onlineState.roomCode !== code) return;
    const movesObj = snap.val() || {};
    const moveList = Object.keys(movesObj).sort().map(k => movesObj[k]);
    replayOnlineMoves(moveList);
  });
}

function replayOnlineMoves(moveDescriptors) {
  let state = freshState();
  let sanHistory = [];
  let capturedByColor = { w: [], b: [] };
  let lastMove = null;

  for (const desc of moveDescriptors) {
    const legal = legalMovesForPiece(state, desc.r1, desc.c1);
    const move = legal.find(m => m.to.r === desc.r2 && m.to.c === desc.c2 &&
      (desc.promotion ? m.promotion === desc.promotion : !m.promotion));

    if (!move) {
      console.error('[müco31] Senkronizasyon hatası: geçersiz hamle verisi', desc);
      break;
    }

    const preMoveState = state;
    const movingColor = state.turn;
    const { state: next, capturedPiece } = applyMove(state, move);
    if (capturedPiece) capturedByColor[movingColor].push(capturedPiece.type);

    const opponent = next.turn;
    const opponentMoves = allLegalMoves(next, opponent);
    const inCheck = isInCheck(next.board, opponent);
    const isMate = inCheck && opponentMoves.length === 0;
    sanHistory.push(moveToNotation(preMoveState, move, inCheck, isMate));

    lastMove = move;
    state = next;
  }

  onlineState.gameState = state;
  onlineState.sanHistory = sanHistory;
  onlineState.capturedByColor = capturedByColor;
  onlineState.lastMove = lastMove;
  onlineState.moveDescriptors = moveDescriptors;
  onlineState.selected = null;
  onlineState.legalForSelected = [];

  const opponentMoves = allLegalMoves(state, state.turn);
  const inCheck = isInCheck(state.board, state.turn);
  const isMate = inCheck && opponentMoves.length === 0;
  const isStalemate = !inCheck && opponentMoves.length === 0;

  onlineState.gameOver = isMate || isStalemate;
  onlineState.result = isMate
    ? ((state.turn === 'w' ? 'Siyah' : 'Beyaz') + ' kazandı — şah mat!')
    : (isStalemate ? 'Pat! Oyun berabere bitti.' : null);

  renderOnlineBoard();
  renderOnlineMoveLog();
  renderOnlineCaptured();
  updateOnlineStatusText();
}

/* ---------- Rendering (reuses helpers defined in app.js) ---------- */

function renderOnlineBoard() {
  renderBoardGeneric(document.getElementById('onlineBoard'), onlineState.gameState, {
    selected: onlineState.selected,
    legalMoves: onlineState.legalForSelected,
    lastMove: onlineState.lastMove,
    orientation: onlineState.color || 'w',
    onSquareClick: onOnlineSquareClick,
  });
  updateCoords('onlineFiles', 'onlineRanks', onlineState.color || 'w');
}

function renderOnlineCaptured() {
  renderCapturedGeneric(
    document.getElementById('onlineCapturedByWhite'),
    document.getElementById('onlineCapturedByBlack'),
    onlineState.capturedByColor
  );
}

function renderOnlineMoveLog() {
  const el = document.getElementById('onlineMoveLog');
  if (!el) return;
  if (onlineState.sanHistory.length === 0) {
    el.innerHTML = '<p class="log-empty">Henüz hamle yok.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < onlineState.sanHistory.length; i += 2) {
    const num = i / 2 + 1;
    const w = onlineState.sanHistory[i] || '';
    const b = onlineState.sanHistory[i + 1] || '';
    html += `<div class="log-row"><span class="num">${num}.</span><span>${w}</span><span>${b}</span></div>`;
  }
  el.innerHTML = html;
  el.scrollTop = el.scrollHeight;
}

function updateOnlineStatusText() {
  const statusEl = document.getElementById('onlineStatus');
  if (!statusEl) return;

  if (!onlineState.opponentPresent) {
    statusEl.textContent = 'Rakip bekleniyor…';
    return;
  }
  if (onlineState.gameOver) {
    statusEl.textContent = onlineState.result || 'Oyun bitti.';
    return;
  }
  const myTurn = onlineState.gameState.turn === onlineState.color;
  statusEl.textContent = myTurn ? 'Sıra sende' : 'Rakibin sırası…';
}

/* ---------- Move input ---------- */

function onOnlineSquareClick(r, c) {
  if (!onlineState.roomCode || onlineState.gameOver) return;
  if (!onlineState.opponentPresent) return;
  if (onlineState.gameState.turn !== onlineState.color) return;

  const piece = onlineState.gameState.board[r][c];
  const move = onlineState.legalForSelected.find(m => m.to.r === r && m.to.c === c);

  if (onlineState.selected && move) {
    playOnlineMove(move);
    return;
  }

  if (piece && piece.color === onlineState.gameState.turn) {
    onlineState.selected = { r, c };
    onlineState.legalForSelected = legalMovesForPiece(onlineState.gameState, r, c);
  } else {
    onlineState.selected = null;
    onlineState.legalForSelected = [];
  }
  renderOnlineBoard();
}

function playOnlineMove(move) {
  if (move.promotion) {
    const variants = onlineState.legalForSelected.filter(m => m.to.r === move.to.r && m.to.c === move.to.c && m.promotion);
    openPromotionDialog(onlineState.color, variants, (chosen) => pushOnlineMove(chosen));
    return;
  }
  pushOnlineMove(move);
}

function pushOnlineMove(move) {
  if (!onlineState.movesRef) return;
  const descriptor = {
    r1: move.from.r, c1: move.from.c,
    r2: move.to.r, c2: move.to.c,
  };
  if (move.promotion) descriptor.promotion = move.promotion;

  onlineState.movesRef.push(descriptor).catch(err => {
    console.error('[müco31] Hamle gönderilemedi:', err);
  });
  // Not: yerel durumu burada değiştirmiyoruz — yukarıdaki 'value' dinleyicisi
  // hem bizim hem rakibin hamlesini aynı yoldan işleyip senkron kalmamızı sağlıyor.
}

/* ---------- Game analysis ---------- */

on('analyzeGameBtn', 'click', () => {
  if (!onlineState.moveDescriptors || onlineState.moveDescriptors.length === 0) return;
  showAnalysisView();
});

on('closeAnalysisBtn', 'click', () => {
  hideAnalysisView();
});

function showAnalysisView() {
  document.getElementById('onlineGameArea').hidden = true;
  document.getElementById('onlineAnalysis').hidden = false;
  document.getElementById('analysisSummary').innerHTML = '<p class="log-empty">Analiz ediliyor…</p>';
  document.getElementById('analysisMoveList').innerHTML = '';
  document.getElementById('analysisGraph').innerHTML = '';

  const descriptors = onlineState.moveDescriptors.slice();
  setTimeout(() => {
    const result = analyzeGame(descriptors, { depth: 1 });
    renderAnalysisSummary(result.stats);
    renderAnalysisGraph(result.evalTrend);
    renderAnalysisMoveList(result.perMove);
  }, 30);
}

function hideAnalysisView() {
  document.getElementById('onlineAnalysis').hidden = true;
  document.getElementById('onlineGameArea').hidden = false;
}

function renderAnalysisSummary(stats) {
  const el = document.getElementById('analysisSummary');
  const build = (color, label) => {
    const s = stats[color];
    const avg = s.count ? s.totalLoss / s.count : 0;
    const accuracy = s.count ? Math.max(0, Math.min(100, Math.round(100 - avg / 8))) : 100;
    return `
      <div class="analysis-card">
        <h3>${label}</h3>
        <p class="analysis-accuracy">${accuracy}<span>%</span></p>
        <p class="analysis-accuracy-label">tahmini doğruluk</p>
        <ul class="analysis-stats-list">
          <li><span class="dot best"></span>En iyi: ${s.best}</li>
          <li><span class="dot good"></span>İyi: ${s.good}</li>
          <li><span class="dot inaccuracy"></span>Hassas nokta: ${s.inaccuracy}</li>
          <li><span class="dot mistake"></span>Hata: ${s.mistake}</li>
          <li><span class="dot blunder"></span>Ciddi hata: ${s.blunder}</li>
        </ul>
      </div>`;
  };
  el.innerHTML = build('w', 'Beyaz') + build('b', 'Siyah');
}

function renderAnalysisGraph(evalTrend) {
  const svg = document.getElementById('analysisGraph');
  const width = 600, height = 160, midY = height / 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const scale = 0.11;
  const n = evalTrend.length;
  const stepX = n > 1 ? width / (n - 1) : width;

  const points = evalTrend.map((v, i) => {
    const x = i * stepX;
    const y = clamp(midY - v * scale, 6, height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `0,${midY} ${points} ${width},${midY}`;

  svg.innerHTML = `
    <polygon points="${areaPoints}" style="fill:var(--accent-dim);stroke:none;" />
    <line x1="0" y1="${midY}" x2="${width}" y2="${midY}" style="stroke:var(--panel-line);stroke-width:1" />
    <polyline points="${points}" style="fill:none;stroke:var(--accent);stroke-width:2;stroke-linejoin:round;stroke-linecap:round" />
  `;
}

function renderAnalysisMoveList(perMove) {
  const el = document.getElementById('analysisMoveList');
  if (perMove.length === 0) {
    el.innerHTML = '<p class="log-empty">Analiz edilecek hamle yok.</p>';
    return;
  }
  el.innerHTML = perMove.map(m => {
    const moveNo = Math.ceil(m.ply / 2);
    const label = m.color === 'w' ? `${moveNo}.` : `${moveNo}…`;
    return `
      <div class="analysis-move-row ${m.classification.tag}">
        <span class="analysis-move-num">${label}</span>
        <span class="analysis-move-san">${m.san}</span>
        <span class="analysis-move-tag">${m.classification.icon} ${m.classification.label}</span>
      </div>`;
  }).join('');
}
