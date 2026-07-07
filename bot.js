/* ============================================================
   bot.js — basit satranç rakibi (minimax) ve koç ipuçları
   ============================================================ */

// Piyonlar için merkez/ilerleme bonusu (satır 0 = 8. sıra, satır 7 = 1. sıra)
const PAWN_TABLE_WHITE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

function pieceSquareBonus(type, color, r, c) {
  const row = color === 'w' ? r : 7 - r;
  if (type === 'P') return PAWN_TABLE_WHITE[row][c];
  if (type === 'N') return KNIGHT_TABLE[row][c];
  if (type === 'B' || type === 'Q') {
    // hafif merkez bonusu
    const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
    return (7 - centerDist) * 2;
  }
  return 0;
}

function evaluatePosition(state) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      const value = PIECE_VALUES[p.type] + pieceSquareBonus(p.type, p.color, r, c);
      score += p.color === 'w' ? value : -value;
    }
  }
  // Rok yapmış olmak küçük bir güvenlik bonusu verir
  if (!state.castling.w.king && !state.castling.w.queen) score += 15;
  if (!state.castling.b.king && !state.castling.b.queen) score -= 15;
  return score;
}

function orderMoves(state, moves) {
  return moves.slice().sort((a, b) => {
    const av = a.capture ? (PIECE_VALUES[state.board[a.to.r][a.to.c]?.type] || 0) : 0;
    const bv = b.capture ? (PIECE_VALUES[state.board[b.to.r][b.to.c]?.type] || 0) : 0;
    return bv - av;
  });
}

function minimax(state, depth, alpha, beta, maximizing) {
  const color = maximizing ? 'w' : 'b';
  const moves = allLegalMoves(state, color);

  if (moves.length === 0) {
    if (isInCheck(state.board, color)) {
      // Şah mat: derinliğe göre skoru ayarla ki motor en hızlı matı tercih etsin
      return maximizing ? -100000 - depth : 100000 + depth;
    }
    return 0; // pat
  }

  if (depth === 0) {
    return evaluatePosition(state);
  }

  const ordered = orderMoves(state, moves);

  if (maximizing) {
    let best = -Infinity;
    for (const move of ordered) {
      const { state: next } = applyMove(state, move);
      const val = minimax(next, depth - 1, alpha, beta, false);
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of ordered) {
      const { state: next } = applyMove(state, move);
      const val = minimax(next, depth - 1, alpha, beta, true);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

/**
 * Botun rengi için en iyi hamleyi (yakın alternatifler arasından biraz
 * rastgelelikle) hesaplar. depth = kaç yarım hamle ileri bakılacağı.
 */
function chooseBotMove(state, botColor, depth = 2) {
  const moves = allLegalMoves(state, botColor);
  if (moves.length === 0) return null;

  const maximizing = botColor === 'w';
  const ordered = orderMoves(state, moves);
  const scored = ordered.map(move => {
    const { state: next } = applyMove(state, move);
    const val = minimax(next, depth - 1, -Infinity, Infinity, !maximizing);
    return { move, val };
  });

  scored.sort((a, b) => maximizing ? b.val - a.val : a.val - b.val);

  const bestVal = scored[0].val;
  const margin = 25; // yakın alternatifleri de göz önünde bulundur (daha "insansı" oyun)
  const topChoices = scored.filter(s => Math.abs(s.val - bestVal) <= margin);
  const pick = topChoices[Math.floor(Math.random() * topChoices.length)];
  return pick.move;
}

/* ---------- Koç: sarkan taş uyarısı ---------- */

function findHangingPieces(board, color) {
  const hanging = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type !== 'K' && isPieceHanging(board, r, c)) {
        hanging.push({ r, c, type: p.type });
      }
    }
  }
  return hanging;
}

const PIECE_NAMES_TR = { P: 'Piyon', N: 'At', B: 'Fil', R: 'Kale', Q: 'Vezir', K: 'Şah' };

function coachFeedbackForMove(state, movedColor) {
  const messages = [];
  const hanging = findHangingPieces(state.board, movedColor)
    .filter(h => PIECE_VALUES[h.type] >= 300);

  for (const h of hanging) {
    messages.push(
      `Dikkat: ${PIECE_NAMES_TR[h.type]} taşınız ${squareName(h.r, h.c)} karesinde savunmasız görünüyor.`
    );
  }

  return messages;
}
