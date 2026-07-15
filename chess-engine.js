/* ============================================================
   chess-engine.js — kurallara uygun satranç motoru (saf mantık)
   ============================================================ */

const PIECE_GLYPHS = {
  w: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
};

const PIECE_VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function squareName(r, c) {
  return FILES[c] + (8 - r);
}

function algebraicToSquare(str) {
  const c = FILES.indexOf(str[0]);
  const r = 8 - parseInt(str[1], 10);
  return { r, c };
}

function initialBoard() {
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: back[c], color: 'b' };
    board[1][c] = { type: 'P', color: 'b' };
    board[6][c] = { type: 'P', color: 'w' };
    board[7][c] = { type: back[c], color: 'w' };
  }
  return board;
}

function freshState() {
  return {
    board: initialBoard(),
    turn: 'w',
    castling: {
      w: { king: true, queen: true },
      b: { king: true, queen: true },
    },
    enPassant: null,
  };
}

function cloneState(state) {
  return {
    board: state.board.map(row => row.map(cell => (cell ? { ...cell } : null))),
    turn: state.turn,
    castling: { w: { ...state.castling.w }, b: { ...state.castling.b } },
    enPassant: state.enPassant ? { ...state.enPassant } : null,
  };
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/* ---------- Attack detection ---------- */

function squareAttackedBy(board, r, c, byColor) {
  const pawnDir = byColor === 'w' ? -1 : 1;
  for (const dc of [-1, 1]) {
    const pr = r - pawnDir;
    const pc = c + dc;
    if (inBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.color === byColor && p.type === 'P') return true;
    }
  }

  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightOffsets) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'N') return true;
    }
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc)) {
        const p = board[nr][nc];
        if (p && p.color === byColor && p.type === 'K') return true;
      }
    }
  }

  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagDirs) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'B' || p.type === 'Q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }

  const orthoDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of orthoDirs) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'R' || p.type === 'Q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }

  return false;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === 'K') return { r, c };
    }
  }
  return null;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  const enemy = color === 'w' ? 'b' : 'w';
  return squareAttackedBy(board, king.r, king.c, enemy);
}

function isPieceHanging(board, r, c) {
  const piece = board[r][c];
  if (!piece) return false;
  const enemy = piece.color === 'w' ? 'b' : 'w';
  if (!squareAttackedBy(board, r, c, enemy)) return false;
  return !squareAttackedBy(board, r, c, piece.color);
}

/* ---------- Pseudo-legal move generation ---------- */

function pseudoMovesForPiece(state, r, c) {
  const { board } = state;
  const piece = board[r][c];
  if (!piece) return [];
  const moves = [];
  const enemy = piece.color === 'w' ? 'b' : 'w';

  const addIfValid = (nr, nc, extra = {}) => {
    if (!inBounds(nr, nc)) return;
    const target = board[nr][nc];
    if (!target || target.color === enemy) {
      moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: !!target, ...extra });
    }
  };

  const slide = (dirs) => {
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: false });
        } else {
          if (target.color === enemy) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true });
          }
          break;
        }
        nr += dr; nc += dc;
      }
    }
  };

  switch (piece.type) {
    case 'P': {
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;
      const promoRow = piece.color === 'w' ? 0 : 7;
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        if (r + dir === promoRow) {
          for (const promo of ['Q', 'R', 'B', 'N']) {
            moves.push({ from: { r, c }, to: { r: r + dir, c }, capture: false, promotion: promo });
          }
        } else {
          moves.push({ from: { r, c }, to: { r: r + dir, c }, capture: false });
        }
        if (r === startRow && !board[r + 2 * dir][c]) {
          moves.push({ from: { r, c }, to: { r: r + 2 * dir, c }, capture: false, doubleStep: true });
        }
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const target = board[nr][nc];
        if (target && target.color === enemy) {
          if (nr === promoRow) {
            for (const promo of ['Q', 'R', 'B', 'N']) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true, promotion: promo });
            }
          } else {
            moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true });
          }
        } else if (state.enPassant && state.enPassant.r === nr && state.enPassant.c === nc) {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, capture: true, enPassant: true });
        }
      }
      break;
    }
    case 'N': {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of offsets) addIfValid(r + dr, c + dc);
      break;
    }
    case 'B':
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
      break;
    case 'R':
      slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
      break;
    case 'Q':
      slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
      break;
    case 'K': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          addIfValid(r + dr, c + dc);
        }
      }
      const color = piece.color;
      const rights = state.castling[color];
      const homeRow = color === 'w' ? 7 : 0;
      if (r === homeRow && c === 4 && rights) {
        const enemyColor = color === 'w' ? 'b' : 'w';
        const inCheckNow = squareAttackedBy(board, r, c, enemyColor);
        if (!inCheckNow) {
          if (rights.king && !board[homeRow][5] && !board[homeRow][6]
              && board[homeRow][7] && board[homeRow][7].type === 'R' && board[homeRow][7].color === color) {
            if (!squareAttackedBy(board, homeRow, 5, enemyColor) && !squareAttackedBy(board, homeRow, 6, enemyColor)) {
              moves.push({ from: { r, c }, to: { r: homeRow, c: 6 }, capture: false, castle: 'king' });
            }
          }
          if (rights.queen && !board[homeRow][1] && !board[homeRow][2] && !board[homeRow][3]
              && board[homeRow][0] && board[homeRow][0].type === 'R' && board[homeRow][0].color === color) {
            if (!squareAttackedBy(board, homeRow, 3, enemyColor) && !squareAttackedBy(board, homeRow, 2, enemyColor)) {
              moves.push({ from: { r, c }, to: { r: homeRow, c: 2 }, capture: false, castle: 'queen' });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

function applyMove(state, move) {
  const next = cloneState(state);
  const { board } = next;
  const piece = board[move.from.r][move.from.c];
  const movingColor = piece.color;

  let capturedPiece = board[move.to.r][move.to.c] || null;

  if (move.enPassant) {
    const capturedRow = move.from.r;
    capturedPiece = board[capturedRow][move.to.c];
    board[capturedRow][move.to.c] = null;
  }

  board[move.from.r][move.from.c] = null;
  board[move.to.r][move.to.c] = move.promotion
    ? { type: move.promotion, color: movingColor }
    : piece;

  if (move.castle === 'king') {
    const row = move.to.r;
    board[row][5] = board[row][7];
    board[row][7] = null;
  } else if (move.castle === 'queen') {
    const row = move.to.r;
    board[row][3] = board[row][0];
    board[row][0] = null;
  }

  if (piece.type === 'K') {
    next.castling[movingColor] = { king: false, queen: false };
  }
  if (piece.type === 'R') {
    const homeRow = movingColor === 'w' ? 7 : 0;
    if (move.from.r === homeRow && move.from.c === 0) next.castling[movingColor].queen = false;
    if (move.from.r === homeRow && move.from.c === 7) next.castling[movingColor].king = false;
  }
  if (capturedPiece && capturedPiece.type === 'R') {
    const oppColor = capturedPiece.color;
    const homeRow = oppColor === 'w' ? 7 : 0;
    if (move.to.r === homeRow && move.to.c === 0) next.castling[oppColor].queen = false;
    if (move.to.r === homeRow && move.to.c === 7) next.castling[oppColor].king = false;
  }

  if (move.doubleStep) {
    const midRow = (move.from.r + move.to.r) / 2;
    next.enPassant = { r: midRow, c: move.from.c };
  } else {
    next.enPassant = null;
  }

  next.turn = movingColor === 'w' ? 'b' : 'w';

  return { state: next, capturedPiece };
}

function legalMovesForPiece(state, r, c) {
  const piece = state.board[r][c];
  if (!piece) return [];
  const pseudo = pseudoMovesForPiece(state, r, c);
  const legal = [];
  for (const move of pseudo) {
    const { state: next } = applyMove(state, move);
    if (!isInCheck(next.board, piece.color)) {
      legal.push(move);
    }
  }
  return legal;
}

function allLegalMoves(state, color) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p && p.color === color) {
        moves.push(...legalMovesForPiece(state, r, c));
      }
    }
  }
  return moves;
}

/* ---------- Notation ---------- */

function moveToNotation(state, move, isCheck, isMate) {
  const piece = state.board[move.from.r][move.from.c];
  if (move.castle === 'king') return isMate ? 'O-O#' : (isCheck ? 'O-O+' : 'O-O');
  if (move.castle === 'queen') return isMate ? 'O-O-O#' : (isCheck ? 'O-O-O+' : 'O-O-O');

  let s = '';
  const dest = squareName(move.to.r, move.to.c);
  const capture = move.capture;

  if (piece.type === 'P') {
    if (capture) s += FILES[move.from.c] + 'x';
    s += dest;
    if (move.promotion) s += '=' + move.promotion;
  } else {
    s += piece.type;
    if (capture) s += 'x';
    s += dest;
  }
  if (isMate) s += '#';
  else if (isCheck) s += '+';
  return s;
}

/* ---------- SAN parsing (for opening-book playback) ---------- */

/* ---------- FEN (Stockfish/UCI motoruyla haberleşmek için) ---------- */

function stateToFEN(state) {
  const rows = [];
  for (let r = 0; r < 8; r++) {
    let row = '';
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) { empty++; continue; }
      if (empty > 0) { row += empty; empty = 0; }
      const letter = p.type.toLowerCase();
      row += p.color === 'w' ? letter.toUpperCase() : letter;
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  const boardPart = rows.join('/');

  let castlingPart = '';
  if (state.castling.w.king) castlingPart += 'K';
  if (state.castling.w.queen) castlingPart += 'Q';
  if (state.castling.b.king) castlingPart += 'k';
  if (state.castling.b.queen) castlingPart += 'q';
  if (!castlingPart) castlingPart = '-';

  const epPart = state.enPassant ? squareName(state.enPassant.r, state.enPassant.c) : '-';

  return `${boardPart} ${state.turn} ${castlingPart} ${epPart} 0 1`;
}

function parseSAN(state, sanStrRaw) {
  const sanStr = sanStrRaw.trim();
  const color = state.turn;

  if (sanStr === 'O-O' || sanStr === 'O-O-O') {
    const castleType = sanStr === 'O-O' ? 'king' : 'queen';
    const moves = allLegalMoves(state, color);
    return moves.find(m => m.castle === castleType) || null;
  }

  const match = sanStr.match(/^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(=([QRBN]))?[+#]?$/);
  if (!match) return null;
  const pieceLetter = match[1];
  const disambFile = match[2];
  const disambRank = match[3];
  const destStr = match[5];
  const promo = match[7];

  const pieceType = pieceLetter || 'P';
  const dest = algebraicToSquare(destStr);

  const candidates = allLegalMoves(state, color).filter(m => {
    const piece = state.board[m.from.r][m.from.c];
    if (piece.type !== pieceType) return false;
    if (m.to.r !== dest.r || m.to.c !== dest.c) return false;
    if (promo && m.promotion !== promo) return false;
    if (!promo && m.promotion) return false;
    if (disambFile && FILES[m.from.c] !== disambFile) return false;
    if (disambRank && (8 - m.from.r) !== parseInt(disambRank, 10)) return false;
    return true;
  });

  return candidates[0] || null;
}
