import React, { useState, useEffect, useRef } from 'react';
import { solveMissionariesBFS } from '../algorithms/bfs';
import Metrics from './Metrics';
import StepsPanel from './StepsPanel';
import { Play, RotateCcw, Anchor, Trees, BrainCircuit, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_STATE = { m: 3, c: 3, b: 1 }; // 1 means boat is on left bank
const TOTAL_M = 3;
const TOTAL_C = 3;

export default function Missionaries() {
  const [boardState, setBoardState] = useState(INITIAL_STATE); // Actually rendered on banks
  const [boatPassengers, setBoatPassengers] = useState({ m: 0, c: 0 }); // In boat rendering
  const [boatPos, setBoatPos] = useState(1); // 1 = left, 0 = right
  
  const [isSolving, setIsSolving] = useState(false);
  const [metrics, setMetrics] = useState({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  const [message, setMessage] = useState('');
  
  // Step visualization states
  const [solutionPath, setSolutionPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let active = true;

    const animateTransition = async (fromState, toState) => {
        setIsAnimating(true);
        const movingM = Math.abs(fromState.m - toState.m);
        const movingC = Math.abs(fromState.c - toState.c);
        
        // 1. Board the boat
        setBoardState({
            m: fromState.b === 1 ? fromState.m - movingM : fromState.m,
            c: fromState.b === 1 ? fromState.c - movingC : fromState.c,
            b: fromState.b
        });
        setBoatPassengers({ m: movingM, c: movingC });
        await new Promise(r => setTimeout(r, 600)); // Sleep 600ms
        
        if (!active) return;
        
        // 2. Cross River
        setBoatPos(toState.b);
        await new Promise(r => setTimeout(r, 800)); // Travel takes 800ms
        
        if (!active) return;
        
        // 3. Unboard the boat
        setBoardState(toState);
        setBoatPassengers({ m: 0, c: 0 });
        await new Promise(r => setTimeout(r, 600)); // Sleep 600ms
        
        if (!active) return;
        
        setIsAnimating(false);
        
        // Autoplay logic
        if (isAutoPlaying && currentStep < solutionPath.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else if (isAutoPlaying && currentStep >= solutionPath.length - 1) {
            setIsAutoPlaying(false);
        }
    };

    if (solutionPath.length > 0 && currentStep > 0 && currentStep < solutionPath.length) {
       const fromState = solutionPath[currentStep - 1];
       const toState = solutionPath[currentStep];
       
       // Detect direction: if boat changed, we animate. Else it's just a jump (like backward)
       animateTransition(fromState, toState);
    } else if (solutionPath.length > 0 && currentStep === 0) {
       // Reset visual state safely
       setIsAnimating(false);
       setBoardState(solutionPath[0]);
       setBoatPos(solutionPath[0].b);
       setBoatPassengers({ m: 0, c: 0 });
       
       if (isAutoPlaying) {
           setTimeout(() => { if (active) setCurrentStep(1); }, 600);
       }
    }

    return () => { active = false; };
  }, [currentStep, solutionPath, isAutoPlaying]);

  const handleCalculatePath = () => {
    if (isSolving) return;
    setIsSolving(true);
    setMessage('Searching state space with BFS...');
    
    setTimeout(() => {
        const result = solveMissionariesBFS();
        if (!result.path) {
          setMessage('No solution found.');
          setIsSolving(false);
          return;
        }

        setMessage('');
        setMetrics({
          nodesExplored: result.nodesExplored,
          timeTaken: result.timeTaken,
          pathLength: result.path.length - 1
        });
        setSolutionPath(result.path);
        setCurrentStep(0);
        setIsAutoPlaying(true);
        setIsSolving(false);
    }, 50);
  };

  const handleReset = () => {
    if (isSolving || isAnimating) return;
    setBoardState(INITIAL_STATE);
    setBoatPos(1);
    setBoatPassengers({ m: 0, c: 0 });
    setSolutionPath([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setMessage('');
    setMetrics({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  };

  const handleNextStep = () => {
    if (currentStep < solutionPath.length - 1 && !isAnimating) {
        setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0 && !isAnimating) {
        setIsAutoPlaying(false);
        // Instant visual jump backward
        const prevState = solutionPath[currentStep - 1];
        setBoardState(prevState);
        setBoatPos(prevState.b);
        setBoatPassengers({ m: 0, c: 0 });
        setCurrentStep(prev => prev - 1);
    }
  };

  const getStepDescription = (idx = currentStep) => {
    if (solutionPath.length === 0) return "Awaiting calculation...";
    if (idx >= solutionPath.length - 1) return "Goal state reached! All safely crossed.";
    
    const prev = solutionPath[idx];
    const next = solutionPath[idx + 1];
    if (!prev || !next) return "Transitioning...";

    const movedM = Math.abs(prev.m - next.m);
    const movedC = Math.abs(prev.c - next.c);
    const direction = prev.b === 1 ? "Left Bank to Right Bank" : "Right Bank to Left Bank";
    
    if (movedM > 0 && movedC > 0) {
       return `Move ${movedM} 👤 Missionary and ${movedC} 🔴 Cannibal from ${direction}`;
    } else if (movedM > 0) {
       return `Move ${movedM} 👤 Missionary${movedM > 1 ? 's' : ''} from ${direction}`;
    } else if (movedC > 0) {
       return `Move ${movedC} 🔴 Cannibal${movedC > 1 ? 's' : ''} from ${direction}`;
    }
    return "Transitioning...";
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in fade-in transition duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Missionaries & Cannibals</h1>
          <p className="text-slate-400 mt-1">Safely trace a path across the river using BFS.</p>
        </div>
      </div>

      <div className="w-full">
         <StepsPanel 
            showSteps={showSteps} setShowSteps={setShowSteps}
            currentStep={currentStep} totalSteps={Math.max(0, solutionPath.length - 1)}
            isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying}
            onNext={handleNextStep} onPrev={handlePrevStep}
            disableControls={solutionPath.length === 0 || isSolving || isAnimating}
            stepDescription={getStepDescription()}
         />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Game Area */}
        <div className="flex flex-col items-center bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700 w-full lg:w-auto overflow-hidden">

          {/* Status Message */}
          <div className="h-6 mb-8 text-sm font-semibold flex items-center w-full justify-center">
            {message ? (
              <span className={`px-4 py-1.5 rounded-full border shadow-sm ${message.includes('No') ? 'text-amber-400 bg-amber-400/10 border-amber-500/50' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/50 animate-pulse'}`}>
                {message}
              </span>
            ) : null}
            {!message && <div className="h-6"></div>}
          </div>

          {/* River Representation */}
          <div className="relative w-full h-64 sm:h-72 bg-slate-900 rounded-2xl overflow-hidden border-x-8 border-amber-900/40 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)] flex shrink-0">
            
            {/* Left Bank */}
            <div className={`w-36 h-full bg-emerald-900/50 border-r-4 border-emerald-900 p-4 transition-all flex flex-col justify-between items-start z-10 backdrop-blur-sm`}>
              <div className="flex flex-col">
                  <span className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-4 opacity-50"><Trees className="inline h-4 w-4 mr-1"/> Left Bank</span>
                  <div className="flex space-x-2 text-xs font-black text-slate-100 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700">
                     <span className="text-indigo-400">M: {boardState.m}</span> | <span className="text-rose-400">C: {boardState.c}</span>
                  </div>
              </div>
              <div className="flex flex-col gap-2 relative">
                <AnimatePresence>
                    <div className="flex flex-wrap gap-2 w-28">
                        {Array.from({ length: boardState.m }).map((_, i) => (
                            <motion.div key={`m-l-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900 border border-indigo-400">M</motion.div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 w-28 mt-2">
                        {Array.from({ length: boardState.c }).map((_, i) => (
                            <motion.div key={`c-l-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-rose-900 border border-rose-400">C</motion.div>
                        ))}
                    </div>
                </AnimatePresence>
              </div>
            </div>

            {/* River Area (center) */}
            <div className="flex-1 h-full relative relative bg-gradient-to-r from-cyan-900 to-blue-900">
              {/* Waves Particle Effect */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 10%, transparent 20%, transparent 100%)', backgroundSize: '15px 15px', animation: 'slideRight 5s linear infinite' }} />
              
              {/* Animated Boat */}
              <motion.div 
                animate={{ 
                  left: boatPos === 1 ? '5%' : 'calc(95% - 80px)'
                }}
                transition={{ type: "spring", stiffness: 45, damping: 15 }}
                className="absolute top-[45%] -translate-y-[45%] w-20 h-16 bg-amber-800 rounded-b-xl border-t-8 border-amber-950 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex items-center justify-center z-20 flex-col pb-2 transition-all duration-300"
              >
                <div className="flex gap-1 absolute -top-8 left-1/2 -translate-x-1/2 min-w-max">
                     <AnimatePresence>
                        {Array.from({ length: boatPassengers.m }).map((_, i) => (
                            <motion.div key={`m-b-${i}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow border border-indigo-400">M</motion.div>
                        ))}
                        {Array.from({ length: boatPassengers.c }).map((_, i) => (
                            <motion.div key={`c-b-${i}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="w-7 h-7 bg-rose-600 rounded-lg flex items-center justify-center text-xs text-white font-bold shadow border border-rose-400">C</motion.div>
                        ))}
                     </AnimatePresence>
                </div>
                <Anchor className="h-5 w-5 text-amber-500/50 mt-auto" />
              </motion.div>
            </div>

            {/* Right Bank */}
            <div className={`w-36 h-full bg-emerald-900/50 border-l-4 border-emerald-900 p-4 transition-all flex flex-col justify-between items-end z-10 backdrop-blur-sm`}>
              <div className="flex flex-col text-right items-end">
                  <span className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-4 opacity-50">Right Bank <Trees className="inline h-4 w-4 ml-1"/></span>
                  <div className="flex space-x-2 text-xs font-black text-slate-100 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700">
                     <span className="text-indigo-400">M: {TOTAL_M - boardState.m - (boatPos === 0 ? boatPassengers.m : 0)}</span> | <span className="text-rose-400">C: {TOTAL_C - boardState.c - (boatPos === 0 ? boatPassengers.c : 0)}</span>
                  </div>
              </div>
              <div className="flex flex-col gap-2 items-end relative">
                <AnimatePresence>
                    <div className="flex flex-wrap gap-2 w-28 justify-end">
                        {Array.from({ length: TOTAL_M - boardState.m - (boatPos === 0 ? boatPassengers.m : 0) }).map((_, i) => (
                            <motion.div key={`m-r-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900 border border-indigo-400">M</motion.div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 w-28 mt-2 justify-end">
                        {Array.from({ length: TOTAL_C - boardState.c - (boatPos === 0 ? boatPassengers.c : 0) }).map((_, i) => (
                            <motion.div key={`c-r-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-rose-900 border border-rose-400">C</motion.div>
                        ))}
                    </div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8 justify-center w-full relative z-10">
            <button
              onClick={handleReset}
              disabled={isSolving || isAnimating}
              className="flex items-center px-6 py-3 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" strokeWidth={3}/> Reset
            </button>
            <button
              onClick={handleCalculatePath}
              disabled={isSolving || solutionPath.length > 0}
              className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <Users className="h-5 w-5 mr-2" strokeWidth={2.5}/> Calculate Path
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="w-full lg:w-1/3 flex-1 flex flex-col gap-6">
          <Metrics 
            timeTaken={metrics.timeTaken}
            nodesExplored={metrics.nodesExplored}
            algorithm="Breadth First"
            customLabel1="Crossings"
            customValue1={metrics.pathLength}
          />
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center tracking-tight">
               <BrainCircuit className="h-6 w-6 mr-3 text-indigo-400"/> How BFS works
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed space-y-3 font-medium">
              <span><strong>Breadth-First Search (BFS)</strong> guarantees the shortest path to the goal in an unweighted graph.</span>
              <br/><br/>
              <span>In this problem, we evaluate boat crossings level-by-level, discarding overlapping/invalid paths, rendering only safe sequences safely navigating all personnel.</span>
            </p>
          </div>
          
          {/* Steps List Panel addition */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center tracking-tight shrink-0">
               <BrainCircuit className="h-6 w-6 mr-3 text-indigo-400"/> Steps List Panel
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
               {solutionPath.length > 0 ? (
                 <ul className="space-y-2 w-full">
                   {solutionPath.slice(0, -1).map((_, idx) => (
                      <li key={idx} className={`p-3 rounded-lg text-sm border flex flex-col ${idx === currentStep ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-sm' : idx < currentStep ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
                         <span className={`font-bold mb-1 text-xs uppercase tracking-wider ${idx === currentStep ? 'text-indigo-400' : 'text-slate-400'}`}>Step {idx + 1}</span> 
                         <span>{getStepDescription(idx)}</span>
                      </li>
                   ))}
                   <li className={`p-3 rounded-lg text-sm border ${currentStep === solutionPath.length - 1 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold shadow-sm' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
                      Goal state reached! All safely crossed.
                   </li>
                 </ul>
               ) : (
                 <div className="text-sm text-slate-500 italic">Run Calculate Path to generate steps list.</div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
