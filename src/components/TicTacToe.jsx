import React, { useState, useEffect } from 'react';
import { getBestMove, checkWin, checkDraw } from '../algorithms/minimax';
import Metrics from './Metrics';
import { RotateCcw, User, Cpu, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { sleep } from '../utils/helpers';

const initialBoard = Array(9).fill(null);

export default function TicTacToe() {
  const [board, setBoard] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  const [metrics, setMetrics] = useState({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      if (checkWin(board, 'X')) { setWinner('User (X)'); return; }
      if (checkWin(board, 'O')) { setWinner('AI (O)'); return; }
      if (checkDraw(board)) { setIsDraw(true); return; }

      if (!isXNext && !winner && !isDraw) {
        setIsAITurn(true);
        const playAI = async () => {
          await sleep(500);
          try {
            const aiResult = getBestMove([...board], 'O', 'X');
            if (aiResult.bestMove !== -1) {
              const newBoard = [...board];
              newBoard[aiResult.bestMove] = 'O';
              setBoard(newBoard);
              setMetrics({
                nodesExplored: aiResult.nodesExplored,
                timeTaken: aiResult.timeTaken,
                pathLength: 1
              });
            }
          } catch (err) {
            console.error(err);
            setHasError(true);
          } finally {
            setIsXNext(true);
            setIsAITurn(false);
          }
        };
        playAI();
      }
    } catch (err) {
      console.error(err);
      setHasError(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, isXNext, winner, isDraw]);

  const handleCellClick = (index) => {
    if (board[index] || winner || isDraw || !isXNext || isAITurn) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setIsXNext(true);
    setWinner(null);
    setIsDraw(false);
    setIsAITurn(false);
    setHasError(false);
    setMetrics({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  };

  if (hasError) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 shadow-sm max-w-xl mx-auto mt-12">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-900 mb-2">Game Error</h2>
        <p className="text-rose-700 mb-6">The Minimax calculation encountered an unexpected state.</p>
        <button onClick={resetGame} className="px-6 py-2 bg-rose-600 text-white rounded-xl shadow hover:bg-rose-700">Restart Game</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in fade-in transition duration-500">
      
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tic-Tac-Toe vs Minimax AI</h1>
          <p className="text-slate-500 mt-1">Play against an unbeatable AI utilizing adversarial search.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 shadow-inner">
          <div className={`flex items-center space-x-2 font-semibold px-3 py-1 rounded-lg transition-colors ${isXNext ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-400'}`}>
            <User className="h-4 w-4" /> <span>You (X)</span>
          </div>
          <span className="text-slate-300 font-bold">vs</span>
          <div className={`flex items-center space-x-2 font-semibold px-3 py-1 rounded-lg transition-colors ${!isXNext ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-400'}`}>
            <span>AI (O)</span> <Cpu className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full lg:w-auto">
          {isAITurn ? (
            <div className="h-6 mb-4 text-rose-500 font-medium flex items-center animate-pulse">
              <Cpu className="h-4 w-4 mr-2" /> AI is thinking...
            </div>
          ) : board.filter(c => c !== null).length === 0 ? (
            <div className="h-6 mb-4 text-slate-500 font-bold uppercase tracking-widest text-sm flex items-center">
              Your move first
            </div>
          ) : (
            <div className="h-6 mb-4"></div>
          )}

          <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-100 p-3 sm:p-4 rounded-xl">
            {board.map((value, index) => {
              const isX = value === 'X';
              return (
                <button
                  key={`cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  disabled={value !== null || winner !== null || isDraw || !isXNext || isAITurn}
                  className={`w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl shadow-sm border border-slate-200 text-5xl sm:text-6xl flex items-center justify-center font-bold tracking-tight transition-all 
                  ${!value && !winner && isXNext && !isAITurn ? 'hover:bg-slate-50 hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
                  ${isX ? 'text-indigo-600' : 'text-rose-500'}`}
                >
                  {value && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      {value}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 h-auto flex flex-col items-center justify-center w-full">
            {winner ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center text-xl font-bold text-green-600 bg-green-50 px-6 py-2 rounded-full border border-green-200 shadow-sm mb-4">
                🎉 {winner} wins!
              </motion.div>
            ) : isDraw ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center text-xl font-bold text-slate-600 bg-slate-100 px-6 py-2 rounded-full border border-slate-200 shadow-sm mb-4">
                🤝 It's a Draw!
              </motion.div>
            ) : null}

            {(winner || isDraw) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col p-5 bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-xs shadow-sm">
                <h4 className="font-bold text-indigo-600 text-[10px] mb-3 uppercase tracking-wider border-b border-indigo-100 pb-2">Vs Minimax AI Performance</h4>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Your Moves (X):</span>
                  <span className="font-bold text-slate-900">{board.filter(c => c === 'X').length}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>AI Moves (O):</span>
                  <span className="font-bold text-slate-900">{board.filter(c => c === 'O').length}</span>
                </div>
                <div className={`flex justify-between font-bold text-sm mt-2 pt-2 border-t border-slate-200 ${isDraw ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <span>Strategy Efficiency:</span>
                  <span>{isDraw ? '100% (Optimal)' : '0% (Sub-optimal)'}</span>
                </div>
              </motion.div>
            )}
          </div>

          <button
            onClick={resetGame}
            className="mt-6 flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 font-bold tracking-wide uppercase text-sm"
          >
            <RotateCcw className="h-5 w-5 mr-2" /> Reset Match
          </button>
        </div>

        <div className="w-full lg:w-1/3 flex-1 flex flex-col gap-6">
          <Metrics 
            timeTaken={metrics.timeTaken}
            nodesExplored={metrics.nodesExplored}
            algorithm="Minimax"
            customLabel1="Moves Made"
            customValue1={board.filter(c => c === 'O').length}
          />
          <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
             <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">How it works</h3>
             <p className="text-sm text-indigo-800 leading-relaxed space-y-3">
               <span>The <strong>Minimax</strong> algorithm evaluates all possible moves.</span><br/><br/>
               <span>It guarantees that the AI minimizes losses and maximizes wins by assuming the user plays optimally.</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
