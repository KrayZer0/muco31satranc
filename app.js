/* ============================================================
   app.js — arayüz denetleyicisi (dersler + serbest oyun)
   ============================================================ */

/* ---------- Shared DOM helpers ---------- */

function on(id, event, handler) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[müco31] "${id}" adlı eleman bulunamadı — dosyalar eksik/eski yüklenmiş olabilir.`);
    return;
  }
  el.addEventListener(event, handler);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

const PIECE_SHAPES = {
  P: [
    { tag: 'circle', attrs: { cx: 22.5, cy: 12, r: 6.5 } },
    { tag: 'path', attrs: { d: 'M18 19 h9 v4 h-9 z' } },
    { tag: 'path', attrs: { d: 'M14 34 l3 -11 h11 l3 11 z' } },
    { tag: 'rect', attrs: { x: 11, y: 34, width: 23, height: 4, rx: 1.5 } },
  ],
  R: [
    { tag: 'rect', attrs: { x: 10, y: 8, width: 5, height: 6 } },
    { tag: 'rect', attrs: { x: 20, y: 8, width: 5, height: 6 } },
    { tag: 'rect', attrs: { x: 30, y: 8, width: 5, height: 6 } },
    { tag: 'rect', attrs: { x: 10, y: 14, width: 25, height: 4 } },
    { tag: 'path', attrs: { d: 'M14 18 h17 l2 12 h-21 z' } },
    { tag: 'rect', attrs: { x: 9, y: 34, width: 27, height: 4, rx: 1.5 } },
  ],
  B: [
    { tag: 'circle', attrs: { cx: 22.5, cy: 8, r: 2.8 } },
    { tag: 'path', attrs: { d: 'M22.5 12 c-6 4 -8 11 -8 15 c0 4 3.5 6 8 6 s8 -2 8 -6 c0 -4 -2 -11 -8 -15 z' } },
    { tag: 'rect', attrs: { x: 19, y: 20, width: 7, height: 2.4, rx: 1 } },
    { tag: 'rect', attrs: { x: 12, y: 34, width: 21, height: 4, rx: 1.5 } },
  ],
  N: [
    { tag: 'path', attrs: { d: 'M11 34 c-0.5 -3 0.5 -5 3 -6 c-3 -2.5 -3.5 -6 -2 -9 c1 -2 2.5 -3 2.5 -3 c-1 -2.5 0 -5.5 2.5 -6.5 c2 -0.8 4 0 5 1.5 c3.5 -1 7.5 0 9.5 3 c1.8 2.7 1.8 6.3 0 9 c1.8 1.3 2.5 3 2.5 5 v6 z' } },
    { tag: 'rect', attrs: { x: 9, y: 34, width: 27, height: 4, rx: 1.5 } },
  ],
  Q: [
    { tag: 'circle', attrs: { cx: 22.5, cy: 6, r: 2.3 } },
    { tag: 'circle', attrs: { cx: 12, cy: 10, r: 2.1 } },
    { tag: 'circle', attrs: { cx: 33, cy: 10, r: 2.1 } },
    { tag: 'circle', attrs: { cx: 17, cy: 7.5, r: 1.8 } },
    { tag: 'circle', attrs: { cx: 28, cy: 7.5, r: 1.8 } },
    { tag: 'path', attrs: { d: 'M12 10 L14.5 25 H30.5 L33 10 L27 16 L22.5 8 L18 16 Z' } },
    { tag: 'path', attrs: { d: 'M14 25 h17 l1.5 8 h-20 z' } },
    { tag: 'rect', attrs: { x: 10, y: 35, width: 25, height: 4, rx: 1.5 } },
  ],
  K: [
    { tag: 'path', attrs: { d: 'M21 3 h3 v4 h4 v3 h-4 v4 h-3 v-4 h-4 v-3 h4 z' } },
    { tag: 'path', attrs: { d: 'M14 15 L16.5 25 H28.5 L31 15 L25 19.5 L22.5 12 L20 19.5 Z' } },
    { tag: 'path', attrs: { d: 'M14 25 h17 l1.5 8 h-20 z' } },
    { tag: 'rect', attrs: { x: 10, y: 35, width: 25, height: 4, rx: 1.5 } },
  ],
};

function createPieceIcon(type, color, extraClass) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 45 45');
  svg.classList.add('piece-icon', 'piece-' + color);
  if (extraClass) svg.classList.add(extraClass);
  const shapes = PIECE_SHAPES[type] || [];
  for (const shape of shapes) {
    const el = document.createElementNS(SVG_NS, shape.tag);
    for (const key in shape.attrs) {
      el.setAttribute(key, shape.attrs[key]);
    }
    el.setAttribute('fill', 'currentColor');
    svg.appendChild(el);
  }
  return svg;
}

function renderBoardGeneric(boardEl, gameState, opts) {
  boardEl.innerHTML = '';
  const orientation = opts.orientation || 'w';
  const kingInCheckColor = isInCheck(gameState.board, gameState.turn) ? gameState.turn : null;
  const kingPos = kingInCheckColor ? findKing(gameState.board, kingInCheckColor) : null;
  const legalMoves = opts.legalMoves || [];

  for (let dr = 0; dr < 8; dr++) {
    for (let dc = 0; dc < 8; dc++) {
      const r = orientation === 'w' ? dr : 7 - dr;
      const c = orientation === 'w' ? dc : 7 - dc;

      const sq = document.createElement('div');
      sq.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      sq.dataset.r = r;
      sq.dataset.c = c;

      if (opts.lastMove && (
        (opts.lastMove.from.r === r && opts.lastMove.from.c === c) ||
        (opts.lastMove.to.r === r && opts.lastMove.to.c === c)
      )) {
        sq.classList.add('last-move');
      }
      if (opts.selected && opts.selected.r === r && opts.selected.c === c) {
        sq.classList.add('selected');
      }
      if (kingPos && kingPos.r === r && kingPos.c === c) {
        sq.classList.add('in-check');
      }
      const mv = legalMoves.find(m => m.to.r === r && m.to.c === c);
      if (mv) sq.classList.add(mv.capture ? 'legal-capture' : 'legal-move');

      if (opts.hintMove) {
        if (opts.hintMove.from.r === r && opts.hintMove.from.c === c) sq.classList.add('hint-from');
        if (opts.hintMove.to.r === r && opts.hintMove.to.c === c) sq.classList.add('hint-to');
      }

      const piece = gameState.board[r][c];
      if (piece) {
        sq.appendChild(createPieceIcon(piece.type, piece.color));
      }

      sq.addEventListener('click', () => opts.onSquareClick(r, c));
      boardEl.appendChild(sq);
    }
  }
}

function updateCoords(filesElId, ranksElId, orientation) {
  const filesEl = document.getElementById(filesElId);
  const ranksEl = document.getElementById(ranksElId);
  const files = orientation === 'w' ? FILES : FILES.slice().reverse();
  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  filesEl.innerHTML = files.map(f => `<span>${f}</span>`).join('');
  ranksEl.innerHTML = ranks.map(r => `<span>${r}</span>`).join('');
}

function renderCapturedGeneric(whiteEl, blackEl, capturedByColor) {
  const build = (color, list) => list.map(t => createPieceIcon(t, color, 'captured-piece'));
  whiteEl.innerHTML = '';
  whiteEl.append(...build('b', capturedByColor.w));
  blackEl.innerHTML = '';
  blackEl.append(...build('w', capturedByColor.b));
}

function openPromotionDialog(color, variants, onChoose) {
  const promoOverlay = document.getElementById('promoOverlay');
  const promoOptions = document.getElementById('promoOptions');
  promoOptions.innerHTML = '';
  const order = ['Q', 'R', 'B', 'N'];
  for (const type of order) {
    const variant = variants.find(v => v.promotion === type);
    if (!variant) continue;
    const btn = document.createElement('button');
    btn.className = 'promo-btn';
    btn.appendChild(createPieceIcon(type, color));
    btn.addEventListener('click', () => {
      promoOverlay.hidden = true;
      onChoose(variant);
    });
    promoOptions.appendChild(btn);
  }
  promoOverlay.hidden = false;
}

/* ---------- Mode / view switching ---------- */

const views = {
  lessons: document.getElementById('view-lessons'),
  lessonPlay: document.getElementById('view-lessonPlay'),
  freeplay: document.getElementById('view-freeplay'),
  online: document.getElementById('view-online'),
};

function switchView(name) {
  for (const key in views) {
    if (views[key]) views[key].hidden = key !== name;
  }
}

function setActiveTab(mode) {
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
}

on('modeTabs', 'click', (e) => {
  const btn = e.target.closest('.mode-tab');
  if (!btn) return;
  const mode = btn.dataset.mode;
  setActiveTab(mode);
  switchView(mode);
});

/* ============================================================
   LESSONS BROWSER
   ============================================================ */

function renderOpeningGrid() {
  const grid = document.getElementById('openingGrid');
  grid.innerHTML = '';
  for (const opening of OPENINGS) {
    const card = document.createElement('button');
    card.className = 'opening-card';
    const badgeClass = opening.heroColor === 'w' ? 'white' : 'black';
    const badgeText = opening.heroColor === 'w' ? 'Beyaz oynarsın' : 'Siyah oynarsın';
    card.innerHTML = `
      <div class="opening-card-head">
        <h3>${opening.name}</h3>
        <span class="hero-badge ${badgeClass}">${badgeText}</span>
      </div>
      <p>${opening.summary}</p>
      <span class="move-count">${opening.moves.length} yarı hamle</span>
    `;
    card.addEventListener('click', () => startLesson(opening));
    grid.appendChild(card);
  }
}

/* ============================================================
   LESSON PLAY
   ============================================================ */

let lessonState = null;

function startLesson(opening) {
  lessonState = {
    opening,
    gameState: freshState(),
    plyIndex: 0,
    selected: null,
    legalForSelected: [],
    lastMove: null,
    hintMove: null,
  };
  document.getElementById('lessonTitle').textContent = opening.name;
  document.getElementById('lessonSummary').textContent = opening.summary;
  document.getElementById('lessonDoneCard').hidden = true;

  switchView('lessonPlay');
  setActiveTab('lessons');

  renderLessonProgress();
  renderLessonBoard();
  advanceIfBookTurn();
}

function renderLessonProgress() {
  const el = document.getElementById('lessonProgress');
  el.innerHTML = '';
  lessonState.opening.moves.forEach((m, i) => {
    const dot = document.createElement('span');
    let cls = 'progress-dot';
    if (i < lessonState.plyIndex) cls += ' done';
    else if (i === lessonState.plyIndex) cls += ' current';
    dot.className = cls;
    el.appendChild(dot);
  });
}

function renderLessonBoard() {
  renderBoardGeneric(document.getElementById('lessonBoard'), lessonState.gameState, {
    selected: lessonState.selected,
    legalMoves: lessonState.legalForSelected,
    lastMove: lessonState.lastMove,
    hintMove: lessonState.hintMove,
    orientation: lessonState.opening.heroColor,
    onSquareClick: onLessonSquareClick,
  });
  updateCoords('lessonFiles', 'lessonRanks', lessonState.opening.heroColor);
}

function setLessonInstruction(main, tip) {
  document.getElementById('lessonInstruction').textContent = main;
  document.getElementById('lessonInstructionTip').textContent = tip || '';
}

function advanceIfBookTurn() {
  if (lessonState.plyIndex >= lessonState.opening.moves.length) {
    showLessonDone();
    return;
  }
  if (lessonState.gameState.turn !== lessonState.opening.heroColor) {
    document.getElementById('lessonTurnText').textContent = 'Rakip oynuyor…';
    setLessonInstruction('…');
    document.getElementById('lessonInstruction').classList.remove('wrong');
    setTimeout(() => {
      const step = lessonState.opening.moves[lessonState.plyIndex];
      const move = parseSAN(lessonState.gameState, step.san);
      applyLessonMove(move, step.note, true);
    }, 550);
  } else {
    document.getElementById('lessonTurnText').textContent = 'Sıra sende';
    document.getElementById('lessonInstruction').classList.remove('wrong');
    const step = lessonState.opening.moves[lessonState.plyIndex];
    const tip = 'Takıldıysan "İpucu" veya "Hamleyi Göster" düğmelerini kullanabilirsin.';
    setLessonInstruction(
      step ? `${step.note} Bu fikri uygulayan hamleyi tahtada bul.` : 'Doğru hamleyi tahtada oynayarak bul.',
      tip
    );
  }
}

function applyLessonMove(move, note, isBook) {
  const { state: next } = applyMove(lessonState.gameState, move);
  lessonState.gameState = next;
  lessonState.lastMove = move;
  lessonState.plyIndex++;
  lessonState.selected = null;
  lessonState.legalForSelected = [];
  lessonState.hintMove = null;

  renderLessonBoard();
  renderLessonProgress();

  document.getElementById('lessonTurnText').textContent = isBook ? 'Açıklama' : 'Doğru! 👍';
  setLessonInstruction(note);
  document.getElementById('lessonInstruction').classList.remove('wrong');

  if (lessonState.plyIndex >= lessonState.opening.moves.length) {
    setTimeout(showLessonDone, 900);
  } else {
    // Rakibin hamlesinin açıklaması daha uzun ekranda kalsın ki okunabilsin;
    // kullanıcının kendi doğru hamlesinden sonra geçiş daha hızlı olabilir.
    const delay = isBook ? 2800 : 1300;
    setTimeout(advanceIfBookTurn, delay);
  }
}

function showLessonDone() {
  document.getElementById('lessonDoneCard').hidden = false;
  document.getElementById('lessonTurnText').textContent = 'Tamamlandı';
}

function onLessonSquareClick(r, c) {
  if (lessonState.plyIndex >= lessonState.opening.moves.length) return;
  if (lessonState.gameState.turn !== lessonState.opening.heroColor) return;

  const piece = lessonState.gameState.board[r][c];
  const targetMove = lessonState.legalForSelected.find(m => m.to.r === r && m.to.c === c);

  if (lessonState.selected && targetMove) {
    const step = lessonState.opening.moves[lessonState.plyIndex];
    const expected = parseSAN(lessonState.gameState, step.san);
    const isCorrect = expected &&
      expected.from.r === targetMove.from.r && expected.from.c === targetMove.from.c &&
      expected.to.r === targetMove.to.r && expected.to.c === targetMove.to.c &&
      expected.promotion === targetMove.promotion;

    if (isCorrect) {
      applyLessonMove(targetMove, step.note, false);
    } else {
      setLessonInstruction('Bu hamle teorik devam değil. Tekrar dene ya da "İpucu" iste.');
      document.getElementById('lessonInstruction').classList.add('wrong');
      lessonState.selected = null;
      lessonState.legalForSelected = [];
      renderLessonBoard();
    }
    return;
  }

  if (piece && piece.color === lessonState.gameState.turn) {
    lessonState.selected = { r, c };
    lessonState.legalForSelected = legalMovesForPiece(lessonState.gameState, r, c);
  } else {
    lessonState.selected = null;
    lessonState.legalForSelected = [];
  }
  renderLessonBoard();
}

on('lessonHintBtn', 'click', () => {
  if (!lessonState || lessonState.gameState.turn !== lessonState.opening.heroColor) return;
  const step = lessonState.opening.moves[lessonState.plyIndex];
  const move = parseSAN(lessonState.gameState, step.san);
  lessonState.hintMove = move;
  renderLessonBoard();
  setTimeout(() => {
    if (lessonState) { lessonState.hintMove = null; renderLessonBoard(); }
  }, 1800);
});

on('lessonShowBtn', 'click', () => {
  if (!lessonState || lessonState.gameState.turn !== lessonState.opening.heroColor) return;
  const step = lessonState.opening.moves[lessonState.plyIndex];
  const move = parseSAN(lessonState.gameState, step.san);
  applyLessonMove(move, step.note, true);
});

on('lessonBackBtn', 'click', () => {
  lessonState = null;
  setActiveTab('lessons');
  switchView('lessons');
});

on('lessonRetryBtn', 'click', () => {
  if (lessonState) startLesson(lessonState.opening);
});

on('lessonContinueBotBtn', 'click', () => {
  const heroColor = lessonState.opening.heroColor;
  const sanHist = lessonState.opening.moves.slice(0, lessonState.plyIndex).map(m => m.san);
  const startState = lessonState.gameState;

  setActiveTab('freeplay');
  switchView('freeplay');
  document.querySelectorAll('#colorPicker .color-btn').forEach(b => b.classList.toggle('active', b.dataset.color === heroColor));
  newFreeGame(heroColor, startState, sanHist);
});

/* ============================================================
   FREE PLAY
   ============================================================ */

let freeState = null;
let currentDifficulty = 'medium';

const DIFFICULTY_SETTINGS = {
  easy: { depth: 1, margin: 80 },
  medium: { depth: 2, margin: 35 },
  hard: { depth: 3, margin: 10 },
};

function newFreeGame(humanColor, initialState, initialSanHistory) {
  const sanHistory = initialSanHistory ? [...initialSanHistory] : [];
  freeState = {
    gameState: initialState ? cloneState(initialState) : freshState(),
    history: [],
    humanColor,
    selected: null,
    legalForSelected: [],
    lastMove: null,
    gameOver: false,
    botThinking: false,
    capturedByColor: { w: [], b: [] },
    sanHistory,
    lastRecognizedId: null,
  };

  document.getElementById('coachLog').innerHTML = '<p class="log-empty">Oynadıkça buradan geri bildirim alacaksın.</p>';
  document.getElementById('freeGameStatus').textContent = '';
  document.getElementById('freeCaption').textContent = 'Bir taş seçmek için tıklayın, sonra gitmek istediğiniz kareye tıklayın.';

  renderFreeMoveLog();
  renderFreeBoard();
  renderFreeCaptured();
  updateFreeTurnIndicator();

  const rec = recognizeOpening(sanHistory);
  if (rec && rec.matchedPlies === sanHistory.length && sanHistory.length > 0) {
    freeState.lastRecognizedId = rec.opening.id;
  }

  maybeTriggerBotMove();
}

function renderFreeBoard() {
  renderBoardGeneric(document.getElementById('freeBoard'), freeState.gameState, {
    selected: freeState.selected,
    legalMoves: freeState.legalForSelected,
    lastMove: freeState.lastMove,
    orientation: freeState.humanColor,
    onSquareClick: onFreeSquareClick,
  });
  updateCoords('freeFiles', 'freeRanks', freeState.humanColor);
}

function renderFreeCaptured() {
  renderCapturedGeneric(
    document.getElementById('freeCapturedByWhite'),
    document.getElementById('freeCapturedByBlack'),
    freeState.capturedByColor
  );
}

function renderFreeMoveLog() {
  const el = document.getElementById('freeMoveLog');
  if (freeState.sanHistory.length === 0) {
    el.innerHTML = '<p class="log-empty">Henüz hamle yok.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < freeState.sanHistory.length; i += 2) {
    const num = i / 2 + 1;
    const w = freeState.sanHistory[i] || '';
    const b = freeState.sanHistory[i + 1] || '';
    html += `<div class="log-row"><span class="num">${num}.</span><span>${w}</span><span>${b}</span></div>`;
  }
  el.innerHTML = html;
  el.scrollTop = el.scrollHeight;
}

function updateFreeTurnIndicator() {
  const dot = document.getElementById('freeTurnDot');
  const text = document.getElementById('freeTurnText');
  dot.classList.toggle('black', freeState.gameState.turn === 'b');
  dot.classList.toggle('thinking', !!freeState.botThinking);

  if (freeState.gameOver) {
    text.textContent = 'Oyun bitti';
  } else if (freeState.botThinking) {
    text.textContent = 'Bot düşünüyor…';
  } else if (freeState.gameState.turn === freeState.humanColor) {
    text.textContent = 'Sıra sende';
  } else {
    text.textContent = freeState.gameState.turn === 'w' ? 'Sıra beyazda' : 'Sıra siyahta';
  }

  document.getElementById('freeUndoBtn').disabled = freeState.history.length === 0 || freeState.botThinking;
}

function addCoachMessage(text, isWarn) {
  const log = document.getElementById('coachLog');
  if (log.querySelector('.log-empty')) log.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'coach-message' + (isWarn ? ' warn' : '');
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function runCoach(movingColor) {
  const rec = recognizeOpening(freeState.sanHistory);
  if (rec && rec.matchedPlies === freeState.sanHistory.length) {
    if (freeState.lastRecognizedId !== rec.opening.id) {
      addCoachMessage(`Bu pozisyon "${rec.opening.name}" açılışına benziyor.`, false);
      freeState.lastRecognizedId = rec.opening.id;
    }
  } else if (freeState.lastRecognizedId) {
    addCoachMessage('Artık bilinen bir açılış hattının dışına çıktınız — buradan kendi planınla devam edebilirsin.', false);
    freeState.lastRecognizedId = null;
  }

  if (movingColor === freeState.humanColor) {
    const warnings = coachFeedbackForMove(freeState.gameState, movingColor);
    for (const w of warnings) addCoachMessage(w, true);
  }
}

function onFreeSquareClick(r, c) {
  if (!freeState || freeState.gameOver || freeState.botThinking) return;
  if (freeState.gameState.turn !== freeState.humanColor) return;

  const piece = freeState.gameState.board[r][c];
  const move = freeState.legalForSelected.find(m => m.to.r === r && m.to.c === c);

  if (freeState.selected && move) {
    playFreeMove(move);
    return;
  }

  if (piece && piece.color === freeState.gameState.turn) {
    freeState.selected = { r, c };
    freeState.legalForSelected = legalMovesForPiece(freeState.gameState, r, c);
  } else {
    freeState.selected = null;
    freeState.legalForSelected = [];
  }
  renderFreeBoard();
}

function playFreeMove(move) {
  if (move.promotion) {
    const variants = freeState.legalForSelected.filter(m => m.to.r === move.to.r && m.to.c === move.to.c && m.promotion);
    openPromotionDialog(freeState.gameState.turn, variants, (chosen) => finalizeFreeMove(chosen));
    return;
  }
  finalizeFreeMove(move);
}

function finalizeFreeMove(move) {
  freeState.history.push({
    state: cloneState(freeState.gameState),
    lastMove: freeState.lastMove,
    capturedByColor: { w: [...freeState.capturedByColor.w], b: [...freeState.capturedByColor.b] },
    sanHistory: [...freeState.sanHistory],
    lastRecognizedId: freeState.lastRecognizedId,
  });

  const movingColor = freeState.gameState.turn;
  const preMoveState = freeState.gameState;
  const { state: next, capturedPiece } = applyMove(freeState.gameState, move);

  if (capturedPiece) freeState.capturedByColor[movingColor].push(capturedPiece.type);

  const opponent = next.turn;
  const opponentMoves = allLegalMoves(next, opponent);
  const inCheck = isInCheck(next.board, opponent);
  const isMate = inCheck && opponentMoves.length === 0;
  const isStalemate = !inCheck && opponentMoves.length === 0;

  const san = moveToNotation(preMoveState, move, inCheck, isMate);
  freeState.sanHistory.push(san);

  freeState.gameState = next;
  freeState.lastMove = move;
  freeState.selected = null;
  freeState.legalForSelected = [];

  renderFreeMoveLog();
  renderFreeBoard();
  renderFreeCaptured();

  runCoach(movingColor);

  if (isMate) {
    freeState.gameOver = true;
    const winner = movingColor === 'w' ? 'Beyaz' : 'Siyah';
    document.getElementById('freeGameStatus').textContent = `Şah mat! ${winner} kazandı.`;
    updateFreeTurnIndicator();
    return;
  }
  if (isStalemate) {
    freeState.gameOver = true;
    document.getElementById('freeGameStatus').textContent = 'Pat! Oyun berabere bitti.';
    updateFreeTurnIndicator();
    return;
  }

  document.getElementById('freeGameStatus').textContent = inCheck
    ? ((opponent === 'w' ? 'Beyaz' : 'Siyah') + ' şah çekiliyor!')
    : '';

  updateFreeTurnIndicator();
  maybeTriggerBotMove();
}

function maybeTriggerBotMove() {
  if (!freeState || freeState.gameOver) return;
  if (freeState.gameState.turn === freeState.humanColor) return;

  freeState.botThinking = true;
  updateFreeTurnIndicator();

  setTimeout(() => {
    if (!freeState) return;
    const botColor = freeState.gameState.turn;
    const settings = DIFFICULTY_SETTINGS[currentDifficulty] || DIFFICULTY_SETTINGS.medium;
    const move = chooseBotMove(freeState.gameState, botColor, settings.depth, settings.margin);
    freeState.botThinking = false;
    if (move) {
      finalizeFreeMove(move);
    } else {
      updateFreeTurnIndicator();
    }
  }, 550);
}

function popFreeHistoryOnce() {
  const prev = freeState.history.pop();
  freeState.gameState = prev.state;
  freeState.lastMove = prev.lastMove;
  freeState.capturedByColor = prev.capturedByColor;
  freeState.sanHistory = prev.sanHistory;
  freeState.lastRecognizedId = prev.lastRecognizedId;
}

on('freeUndoBtn', 'click', () => {
  if (!freeState || freeState.botThinking || freeState.history.length === 0) return;
  popFreeHistoryOnce();
  if (freeState.gameState.turn !== freeState.humanColor && freeState.history.length > 0) {
    popFreeHistoryOnce();
  }
  freeState.selected = null;
  freeState.legalForSelected = [];
  freeState.gameOver = false;
  document.getElementById('freeGameStatus').textContent = '';

  renderFreeMoveLog();
  renderFreeBoard();
  renderFreeCaptured();
  updateFreeTurnIndicator();
});

on('freeNewGameBtn', 'click', () => {
  newFreeGame(freeState ? freeState.humanColor : 'w');
});

on('colorPicker', 'click', (e) => {
  const btn = e.target.closest('.color-btn');
  if (!btn) return;
  document.querySelectorAll('#colorPicker .color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  newFreeGame(btn.dataset.color);
});

on('difficultyPicker', 'click', (e) => {
  const btn = e.target.closest('.color-btn');
  if (!btn) return;
  document.querySelectorAll('#difficultyPicker .color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentDifficulty = btn.dataset.difficulty;
});

/* ============================================================
   Init
   ============================================================ */

function safeInit(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[müco31] "${name}" başlatılırken hata oluştu:`, err);
  }
}

safeInit('renderOpeningGrid', renderOpeningGrid);
safeInit('switchView', () => switchView('lessons'));
safeInit('newFreeGame', () => newFreeGame('w'));
