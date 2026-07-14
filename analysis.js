/* ============================================================
   analysis.js — basit oyun analizi (hamle kalitesi değerlendirme)
   ============================================================ */

function classifyMoveLoss(loss) {
  if (loss < 15) return { tag: 'best', label: 'En iyi hamlelerden biri', icon: '★' };
  if (loss < 40) return { tag: 'good', label: 'İyi hamle', icon: '✓' };
  if (loss < 90) return { tag: 'inaccuracy', label: 'Hassas nokta', icon: '?!' };
  if (loss < 200) return { tag: 'mistake', label: 'Hata', icon: '?' };
  return { tag: 'blunder', label: 'Ciddi hata', icon: '??' };
}

function evaluateCandidateMoves(state, color, depth) {
  const moves = allLegalMoves(state, color);
  const maximizing = color === 'w';
  return moves.map(move => {
    const { state: next } = applyMove(state, move);
    const val = minimax(next, depth - 1, -Infinity, Infinity, !maximizing);
    return { move, val };
  });
}

/**
 * Oynanmış bir oyunu (hamle tanımlayıcıları listesi: {r1,c1,r2,c2,promotion?})
 * baştan tekrar oynayarak her hamlenin kalitesini değerlendirir.
 * Basit bir motora dayanır; profesyonel motorlar kadar güçlü değildir.
 */
function analyzeGame(moveDescriptors, options) {
  const depth = (options && options.depth) || 1;
  let state = freshState();

  const perMove = [];
  const stats = {
    w: { best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, totalLoss: 0, count: 0 },
    b: { best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, totalLoss: 0, count: 0 },
  };
  const evalTrend = [0];

  for (let i = 0; i < moveDescriptors.length; i++) {
    const desc = moveDescriptors[i];
    const color = state.turn;

    const legal = legalMovesForPiece(state, desc.r1, desc.c1);
    const playedMove = legal.find(m => m.to.r === desc.r2 && m.to.c === desc.c2 &&
      (desc.promotion ? m.promotion === desc.promotion : !m.promotion));
    if (!playedMove) break;

    const candidates = evaluateCandidateMoves(state, color, depth);
    const maximizing = color === 'w';
    const bestVal = candidates.length
      ? (maximizing ? Math.max(...candidates.map(c => c.val)) : Math.min(...candidates.map(c => c.val)))
      : 0;
    const playedCandidate = candidates.find(c =>
      c.move.from.r === playedMove.from.r && c.move.from.c === playedMove.from.c &&
      c.move.to.r === playedMove.to.r && c.move.to.c === playedMove.to.c &&
      c.move.promotion === playedMove.promotion
    );
    const playedVal = playedCandidate ? playedCandidate.val : bestVal;
    const loss = Math.max(0, maximizing ? (bestVal - playedVal) : (playedVal - bestVal));
    const cls = classifyMoveLoss(loss);

    const preMoveState = state;
    const { state: next } = applyMove(state, playedMove);
    const opponent = next.turn;
    const opponentMoves = allLegalMoves(next, opponent);
    const inCheck = isInCheck(next.board, opponent);
    const isMate = inCheck && opponentMoves.length === 0;
    const san = moveToNotation(preMoveState, playedMove, inCheck, isMate);

    perMove.push({ ply: i + 1, color, san, loss: Math.round(loss), classification: cls });

    stats[color].count++;
    stats[color].totalLoss += loss;
    stats[color][cls.tag]++;

    evalTrend.push(evaluatePosition(next));
    state = next;
  }

  return { perMove, stats, evalTrend, finalState: state };
}
