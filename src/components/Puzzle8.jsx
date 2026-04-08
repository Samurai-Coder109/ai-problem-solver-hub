import React, { useState, useEffect, useRef } from 'react';
import { solve8PuzzleAStar } from '../algorithms/astar';
import Metrics from './Metrics';
import StepsPanel from './StepsPanel';
import { Shuffle, Play, SearchCode, BrainCircuit, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function isSolvable(state) {
  let inversions = 0;
  const arr = state.filter(n => n !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function generateRandomPuzzle() {
  let state;
  do {
    const arr = [...GOAL_STATE];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    state = arr;
  } while (!isSolvable(state) || state.join(',') === GOAL_STATE.join(','));
  return state;
}

export default function Puzzle8() {
  const [board, setBoard] = useState(GOAL_STATE);
  const [originalState, setOriginalState] = useState(GOAL_STATE);
  const [isSolving, setIsSolving] = useState(false);
  const [metrics, setMetrics] = useState({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  const [errorMsg, setErrorMsg] = useState('');
  
  // Step visualization states
  const [solutionPath, setSolutionPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // User manual play states
  const [userMoves, setUserMoves] = useState(0);
  const [maxMoves, setMaxMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, won, lost
  
  // Ref to track moved tile between step N and N-1
  const movedTileRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isAutoPlaying && currentStep < solutionPath.length - 1) {
        timer = setTimeout(() => {
            handleNextStep();
        }, 500); // 500ms delay for auto play
    } else if (isAutoPlaying && currentStep >= solutionPath.length - 1) {
        setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStep, solutionPath]);

  useEffect(() => {
    if (solutionPath.length > 0) {
        // Track the tile that just moved
        if (currentStep > 0) {
           const prev = solutionPath[currentStep - 1];
           const curr = solutionPath[currentStep];
           const emptyIdxPrev = prev.indexOf(0);
           movedTileRef.current = curr[emptyIdxPrev];
        } else {
           movedTileRef.current = null;
        }
        setBoard(solutionPath[currentStep]);
    }
  }, [currentStep, solutionPath]);

  const handleShuffle = () => {
    if (isSolving || isAutoPlaying) return;
    const newBoard = generateRandomPuzzle();
    setBoard(newBoard);
    setOriginalState(newBoard);
    setSolutionPath([]);
    setCurrentStep(0);
    setErrorMsg('');
    movedTileRef.current = null;
    setMetrics({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
    
    // Evaluate optimal moves for limits
    const result = solve8PuzzleAStar(newBoard);
    if (!result.error && result.path) {
        setMaxMoves(result.path.length - 1);
    } else {
        setMaxMoves(100);
    }
    setUserMoves(0);
    setGameStatus('playing');
  };

  const handleTileClick = (index) => {
    if (gameStatus !== 'playing' || isSolving || isAutoPlaying || solutionPath.length > 0) return;
    
    const emptyIdx = board.indexOf(0);
    const r1 = Math.floor(index / 3), c1 = index % 3;
    const r2 = Math.floor(emptyIdx / 3), c2 = emptyIdx % 3;
    
    // Check adjacency
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
        const newBoard = [...board];
        newBoard[emptyIdx] = board[index];
        newBoard[index] = 0;
        
        setBoard(newBoard);
        movedTileRef.current = board[index]; // Trace move for animation
        const nextMoves = userMoves + 1;
        setUserMoves(nextMoves);
        
        if (newBoard.join(',') === GOAL_STATE.join(',')) {
            setGameStatus('won');
        }
    }
  };

  const handleResetPuzzle = () => {
    if (isSolving || isAutoPlaying) return;
    setBoard(originalState);
    setSolutionPath([]);
    setCurrentStep(0);
    setErrorMsg('');
    movedTileRef.current = null;
    setUserMoves(0);
    setGameStatus(originalState.join(',') === GOAL_STATE.join(',') ? 'won' : 'playing');
  };

  const handleCalculatePath = () => {
    if (isSolving) return;
    if (originalState.join(',') === GOAL_STATE.join(',')) {
      setErrorMsg('Puzzle is already solved.');
      return;
    }

    setIsSolving(true);
    setErrorMsg('Searching for optimal solution...');
    
    setUserMoves(0);
    setGameStatus('idle');

    // Non-blocking trick to allow UI update
    setTimeout(() => {
        const result = solve8PuzzleAStar(originalState);
        if (result.error) {
           setErrorMsg('Failed to solve: ' + result.error);
           setIsSolving(false);
           return;
        }
        if (!result.path || result.path.length === 0) {
           setErrorMsg('No path found.');
           setIsSolving(false);
           return;
        }

        setErrorMsg('');
        setSolutionPath(result.path);
        setMetrics({
          nodesExplored: result.nodesExplored,
          timeTaken: result.timeTaken,
          pathLength: result.path.length - 1
        });
        setCurrentStep(0);
        setIsAutoPlaying(true);
        setIsSolving(false);
    }, 50);
  };

  const handleNextStep = () => {
    if (currentStep < solutionPath.length - 1) {
        setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
        setIsAutoPlaying(false); // pause autoplay if manual override
        setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in fade-in transition duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">8-Puzzle Solver</h1>
          <p className="text-slate-400 mt-1">
            Optimally slide tiles to order them 1-8 using A* and Manhattan Distance.
          </p>
        </div>
      </div>

      <div className="w-full">
         <StepsPanel 
            showSteps={showSteps} setShowSteps={setShowSteps}
            currentStep={currentStep} totalSteps={Math.max(0, solutionPath.length - 1)}
            isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying}
            onNext={handleNextStep} onPrev={handlePrevStep}
            disableControls={solutionPath.length === 0 || isSolving}
            stepDescription={solutionPath.length === 0 ? "Awaiting calculation..." : currentStep === 0 ? "Initial state." : currentStep === solutionPath.length - 1 ? "Goal state reached!" : `Moving tile ${movedTileRef.current} into empty space.`}
         />
         
         {solutionPath.length > 0 && currentStep > 0 && currentStep < solutionPath.length - 1 && showSteps && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-fade-in fade-in transition">
                 <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                     <span className="block text-[10px] tracking-widest uppercase text-indigo-400 font-bold mb-1">Why this move?</span>
                     <p className="text-sm text-slate-300">Reduces overall Manhattan distance score.</p>
                 </div>
                 <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                     <span className="block text-[10px] tracking-widest uppercase text-emerald-400 font-bold mb-1">What AI is thinking</span>
                     <p className="text-sm text-slate-300">Shifting tile closer to final goal configuration matrix.</p>
                 </div>
            </div>
         )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Game Board Section */}
        <div className="flex flex-col items-center bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 w-full lg:w-auto relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full"></div>
          
          {/* Status Message */}
          <div className="h-6 mb-4 text-sm font-semibold flex items-center w-full justify-center">
            {errorMsg ? (
              <span className={`px-4 py-1.5 rounded-full border shadow-sm ${errorMsg.includes('Failed') || errorMsg.includes('already') ? 'text-amber-400 bg-amber-400/10 border-amber-500/50' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/50 animate-pulse'}`}>
                {errorMsg}
              </span>
            ) : gameStatus === 'won' ? (
              <span className="px-4 py-1.5 rounded-full border shadow-sm text-emerald-400 bg-emerald-500/10 border-emerald-500/50 uppercase tracking-widest text-xs">
                You solved it!
              </span>
            ) : (
              <div className="h-6"></div>
            )}
          </div>
          
          {gameStatus !== 'idle' && solutionPath.length === 0 && (
             <div className="flex gap-4 mb-4">
                <div className="bg-slate-900 border border-slate-700 px-4 py-2 w-32 rounded-xl text-center">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Your Moves</span>
                    <span className="text-white font-black text-lg">{userMoves}</span>
                </div>
             </div>
          )}

          {(gameStatus === 'won' || solutionPath.length > 0) && userMoves > 0 && (
            <div className="mb-6 flex flex-col p-4 bg-slate-900/50 border border-slate-700 rounded-xl w-64 sm:w-80 shadow-md animate-fade-in transition">
              <h4 className="font-bold text-indigo-400 text-[10px] mb-3 uppercase tracking-wider border-b border-slate-700/50 pb-2">Scorecard</h4>
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>Optimal Moves:</span>
                <span className="font-bold text-white">{maxMoves}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>Your Moves:</span>
                <span className="font-bold text-white">{userMoves}</span>
              </div>
              <div className={`flex justify-between font-bold text-sm mt-2 pt-2 border-t border-slate-700 ${(Math.round((maxMoves / userMoves) * 100)) >= 100 ? 'text-emerald-400' : (Math.round((maxMoves / userMoves) * 100) > 60 ? 'text-amber-400' : 'text-rose-400')}`}>
                <span>Efficiency Score:</span>
                <span>{Math.min(100, Math.round((maxMoves / userMoves) * 100))}%</span>
              </div>
            </div>
          )}

          {/* Grid Layout (Fixed 300x300 pixel grid container for precise framer-motion absolute mapping) */}
          <div className="grid grid-cols-3 bg-slate-900 border-[8px] border-slate-900 rounded-xl w-64 h-64 sm:w-80 sm:h-80 relative shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <AnimatePresence>
              {board.map((tileValue, index) => {
                const x = (index % 3) * 100;
                const y = Math.floor(index / 3) * 100;

                // Empty space
                if (tileValue === 0) return null; 
                
                // Highlight moving tile
                const isMoved = movedTileRef.current === tileValue;

                return (
                  <motion.div
                    key={tileValue}
                    initial={false}
                    animate={{
                      x: `${x}%`,
                      y: `${y}%`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                    className={`absolute w-1/3 h-1/3 p-1`}
                  >
                    <div 
                      onClick={() => handleTileClick(index)}
                      className={`w-full h-full rounded-lg flex items-center justify-center font-black text-3xl sm:text-4xl transition-all duration-300
                        ${gameStatus === 'playing' && solutionPath.length === 0 ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default'}
                        ${isMoved ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),_0_5px_15px_rgba(245,158,11,0.5)] border border-amber-300/50 z-10 scale-105' : 
                                   'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),_0_4px_8px_rgba(0,0,0,0.5)] border border-indigo-400/30' }
                    `}>
                      {tileValue}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-4 mt-12 justify-center w-full relative z-10">
            <button
              onClick={handleShuffle}
              disabled={isSolving || isAutoPlaying}
              className="flex items-center px-6 py-3 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <Shuffle className="h-4 w-4 mr-2" strokeWidth={3}/> Randomize
            </button>

            <button
              onClick={handleResetPuzzle}
              disabled={isSolving || isAutoPlaying || originalState.join(',') === GOAL_STATE.join(',')}
              className="flex items-center px-6 py-3 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" strokeWidth={3}/> Reset Puzzle
            </button>
            
            <button
              onClick={handleCalculatePath}
              disabled={isSolving || solutionPath.length > 0 || originalState.join(',') === GOAL_STATE.join(',')}
              className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <SearchCode className="h-5 w-5 mr-2" strokeWidth={2.5} /> Calculate Path
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="w-full lg:w-1/3 flex-1 flex flex-col gap-6">
          <Metrics 
            timeTaken={metrics.timeTaken}
            nodesExplored={metrics.nodesExplored}
            pathLength={metrics.pathLength}
            algorithm="A* Search"
            customLabel1="Total Moves"
          />
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center tracking-tight">
               <BrainCircuit className="h-6 w-6 mr-3 text-indigo-400"/> How A* works
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed space-y-3 font-medium">
              <span><strong>A* (A-Star)</strong> is an informed search algorithm heavily used in pathfinding.</span>
              <br/><br/>
              <span>It calculates exactly how far we've traveled from the start (<strong>g-score</strong>) and reliably predicts how far we have left to the goal (<strong>h-score</strong>).</span>
              <br/><br/>
              <span>In this puzzle, we use the <strong>Manhattan Distance</strong> heuristic for the h-score, adding up the horizontal and vertical distance each misplaced tile is from its target location.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
