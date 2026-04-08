/**
 * src/algorithms/minimax.js
 * Implements the Minimax algorithm with optional Alpha-Beta pruning for Tic-Tac-Toe.
 */

// Winning combinations for a 3x3 grid
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

/**
 * Checks if a player has won the game
 * @param {Array<string|null>} board 
 * @param {string} player ('X' or 'O')
 * @returns {boolean}
 */
export function checkWin(board, player) {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the board is completely full (a draw)
 * @param {Array<string|null>} board 
 * @returns {boolean}
 */
export function checkDraw(board) {
  return board.every((cell) => cell !== null);
}

/**
 * Evaluates the board score for the AI
 * @param {Array<string|null>} board
 * @param {string} aiPlayer
 * @param {string} humanPlayer
 * @returns {number}
 */
function evaluate(board, aiPlayer, humanPlayer) {
  if (checkWin(board, aiPlayer)) return 10;
  if (checkWin(board, humanPlayer)) return -10;
  return 0; // Draw
}

/**
 * Minimax algorithm implementation evaluating the full game tree.
 * @param {Array<string|null>} board 
 * @param {number} depth 
 * @param {boolean} isMaximizing 
 * @param {string} aiPlayer ('O' usually)
 * @param {string} humanPlayer ('X' usually)
 * @param {Object} metrics (To track nodes explored)
 * @returns {number} Score of the move
 */
export function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, metrics) {
  metrics.nodesExplored++;
  
  const score = evaluate(board, aiPlayer, humanPlayer);

  // If Maximizer has won the game return evaluated score
  if (score === 10) return score - depth; // Prefer winning sooner

  // If Minimizer has won the game return evaluated score
  if (score === -10) return score + depth; // Prefer losing later

  // If there are no more moves and no winner then it is a tie
  if (checkDraw(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer; // Make the move
        best = Math.max(best, minimax(board, depth + 1, !isMaximizing, aiPlayer, humanPlayer, metrics));
        board[i] = null; // Undo the move
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        best = Math.min(best, minimax(board, depth + 1, !isMaximizing, aiPlayer, humanPlayer, metrics));
        board[i] = null;
      }
    }
    return best;
  }
}

/**
 * Finds the best move for the AI using Minimax
 * @param {Array<string|null>} board - Current 9-cell board 
 * @param {string} aiPlayer - 'O'
 * @param {string} humanPlayer - 'X'
 * @returns {Object} { bestMove: number, nodesExplored: number, timeTaken: number }
 */
export function getBestMove(board, aiPlayer = 'O', humanPlayer = 'X') {
  const t0 = performance.now();
  let bestVal = -Infinity;
  let bestMove = -1;
  const metrics = { nodesExplored: 0 };

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = aiPlayer;
      const moveVal = minimax(board, 0, false, aiPlayer, humanPlayer, metrics);
      board[i] = null;

      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }

  const t1 = performance.now();
  
  return {
    bestMove,
    nodesExplored: metrics.nodesExplored,
    timeTaken: Math.round(t1 - t0)
  };
}
