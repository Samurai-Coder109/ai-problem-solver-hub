import React, { useState, useEffect } from 'react';
import { solveWumpus, generateValidWumpusWorld } from '../algorithms/wumpus';
import StepsPanel from './StepsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw, HelpCircle, ChevronDown, ChevronUp, Hexagon, RotateCcw } from 'lucide-react';

const PREDEFINED_WORLDS = [
  { wumpus: [1,2], gold: [3,2], pits: [[2,0], [3,3]] },
  { wumpus: [2,3], gold: [3,1], pits: [[1,1], [3,2]] },
  { wumpus: [3,0], gold: [2,3], pits: [[1,0], [1,2]] },
  { wumpus: [2,2], gold: [3,3], pits: [[1,1], [1,3]] },
  { wumpus: [1,3], gold: [3,1], pits: [[2,0], [2,2]] }
];

export default function WumpusWorld() {
   const GRID_SIZE = 4;
   
   const generateFromDef = (def) => {
       let grid = Array.from({length: GRID_SIZE}, () => Array.from({length: GRID_SIZE}, () => ({wumpus: false, pit: false, gold: false})));
       grid[def.wumpus[0]][def.wumpus[1]].wumpus = true;
       grid[def.gold[0]][def.gold[1]].gold = true;
       def.pits.forEach(p => grid[p[0]][p[1]].pit = true);
       return grid;
   };

   const [mode, setMode] = useState('PREDEFINED'); 
   const [worldIndex, setWorldIndex] = useState(0);
   const [worldParams, setWorldParams] = useState(() => generateFromDef(PREDEFINED_WORLDS[0]));
   
   const [steps, setSteps] = useState([]);
   const [currentStep, setCurrentStep] = useState(0);
   const [showSteps, setShowSteps] = useState(true);
   const [isAutoPlaying, setIsAutoPlaying] = useState(false);
   const [playSpeed, setPlaySpeed] = useState(800);
   const [showTheory, setShowTheory] = useState(false);
   const [errorMsg, setErrorMsg] = useState("");

   useEffect(() => {
     let timer;
     if (isAutoPlaying && currentStep < steps.length - 1) {
         timer = setTimeout(() => {
             setCurrentStep(p => p + 1);
         }, playSpeed);
     } else if (isAutoPlaying && currentStep >= steps.length - 1) {
         setIsAutoPlaying(false);
     }
     return () => clearTimeout(timer);
   }, [isAutoPlaying, currentStep, steps.length, playSpeed]);

   const handleSolve = () => {
       if (!worldParams) return;
       setErrorMsg("");
       const res = solveWumpus(worldParams, GRID_SIZE);
       setSteps(res);
       setCurrentStep(0);
       setIsAutoPlaying(true);
   };

   const handleRandomize = () => {
       setMode('RANDOM');
       const grid = generateValidWumpusWorld(GRID_SIZE);
       setWorldParams(grid);
       setSteps([]);
       setCurrentStep(0);
       setIsAutoPlaying(false);
       setErrorMsg("");
       setWorldIndex(-1);
   };

   const handlePredefinedChange = (e) => {
       const idx = parseInt(e.target.value);
       setMode('PREDEFINED');
       setWorldIndex(idx);
       setWorldParams(generateFromDef(PREDEFINED_WORLDS[idx]));
       setSteps([]);
       setCurrentStep(0);
       setIsAutoPlaying(false);
       setErrorMsg("");
   };

   const handleReset = () => {
       setSteps([]);
       setCurrentStep(0);
       setIsAutoPlaying(false);
       setErrorMsg("");
   };

   const renderGrid = () => {
       let currentAgentPos = steps.length > 0 ? steps[currentStep].agentPos : [0,0];
       let knownSafe = steps.length > 0 ? new Set(steps[currentStep].knownSafe) : new Set();
       let possibleDanger = steps.length > 0 ? new Set(steps[currentStep].possibleDanger) : new Set();
       let dangerous = steps.length > 0 ? new Set(steps[currentStep].dangerous) : new Set();
       
       let cells = [];
       for (let r = GRID_SIZE - 1; r >= 0; r--) {
           for (let c = 0; c < GRID_SIZE; c++) {
               let isAgent = currentAgentPos[0] === r && currentAgentPos[1] === c;
               let cellStr = `${r},${c}`;
               let isSafe = knownSafe.has(cellStr);
               let isPossible = possibleDanger.has(cellStr);
               let isDanger = dangerous.has(cellStr);
               
               let cellBg = 'bg-slate-800';
               if (isDanger) cellBg = 'bg-rose-900/40 border-rose-500/50';
               else if (isPossible) cellBg = 'bg-amber-900/40 border-amber-500/50';
               else if (isSafe) cellBg = 'bg-emerald-900/20 border-emerald-500/30';
               
               let isBreeze = false;
               let isStench = false;
               
               if (r > 0 && worldParams[r-1][c].pit) isBreeze = true;
               if (r < GRID_SIZE-1 && worldParams[r+1][c].pit) isBreeze = true;
               if (c > 0 && worldParams[r][c-1].pit) isBreeze = true;
               if (c < GRID_SIZE-1 && worldParams[r][c+1].pit) isBreeze = true;
               
               if (r > 0 && worldParams[r-1][c].wumpus) isStench = true;
               if (r < GRID_SIZE-1 && worldParams[r+1][c].wumpus) isStench = true;
               if (c > 0 && worldParams[r][c-1].wumpus) isStench = true;
               if (c < GRID_SIZE-1 && worldParams[r][c+1].wumpus) isStench = true;
               
               let isGlitter = worldParams[r][c].gold;

               let content = [];
               if (worldParams[r][c].wumpus) content.push({em: "👹", cl: "entity-icon z-10"});
               if (worldParams[r][c].pit) content.push({em: "🕳️", cl: "entity-icon z-10"});
               if (worldParams[r][c].gold) content.push({em: "💰", cl: "entity-icon glitter-fx z-10"});
               
               cells.push(
                   <div key={`${r}-${c}`} className={`aspect-square border border-slate-700/80 rounded-xl flex items-center justify-center relative transition-colors duration-300 ${cellBg} ${isAgent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20' : ''}`}>
                       {isBreeze && <div className="breeze z-0" />}
                       {isStench && <div className="stench z-0" />}
                       
                       <span className="absolute top-1 left-1.5 text-[10px] sm:text-[11px] font-mono text-slate-500 opacity-60 z-10">[{r},{c}]</span>
                       <div className="flex flex-wrap gap-1 justify-center items-center text-3xl sm:text-4xl mt-2 z-10 relative">
                           {content.map((obj, idx) => <span key={idx} className={obj.cl}>{obj.em}</span>)}
                       </div>
                       {isAgent && (
                           <motion.div layoutId="agent-wumpus" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 z-30 entity-icon">
                               <span className="text-white text-sm sm:text-base font-bold">🕵️</span>
                           </motion.div>
                       )}
                   </div>
               );
           }
       }
       
       return (
           <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-md mx-auto p-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-inner">
               {cells}
           </div>
       );
   };

   return (
     <div className="flex flex-col h-full space-y-6 animate-fade-in fade-in transition duration-500 relative">
       <style>{`
          .breeze {
             position: absolute;
             inset: 0;
             background: radial-gradient(circle at center, rgba(165,243,252,0.15) 0%, transparent 70%);
             animation: breezePulse 2s infinite ease-in-out;
             pointer-events: none;
             border-radius: inherit;
          }
          @keyframes breezePulse {
             0% { transform: scale(0.9); opacity: 0.3; }
             50% { transform: scale(1.1); opacity: 0.7; }
             100% { transform: scale(0.9); opacity: 0.3; }
          }
          .stench {
             position: absolute;
             inset: 0;
             background: radial-gradient(circle at center, rgba(132,204,22,0.15) 0%, transparent 80%);
             animation: stenchFloat 2s infinite linear;
             pointer-events: none;
             border-radius: inherit;
          }
          @keyframes stenchFloat {
             0% { transform: translateY(0px) scale(1); opacity: 0.4; }
             50% { transform: translateY(-5px) scale(1.05); opacity: 0.8; }
             100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          }
          .glitter-fx {
             animation: sparkle 1s infinite alternate;
          }
          @keyframes sparkle {
             0% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 5px rgba(250,204,21,0.5)); }
             50% { opacity: 0.6; transform: scale(1.2); filter: drop-shadow(0 0 15px rgba(250,204,21,0.9)); }
             100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 5px rgba(250,204,21,0.5)); }
          }
          .entity-icon {
             transform: scale(1.25);
             display: inline-block;
          }
       `}</style>
       <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
         <div>
           <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center">
              <Hexagon className="mr-3 h-6 w-6 text-rose-500" />
              Wumpus World Simulation
           </h1>
           <p className="text-slate-400 mt-1">A classic partially-observable environment solving constraint satisfaction securely using logic tracing.</p>
         </div>
         <button 
            onClick={() => setShowTheory(!showTheory)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-bold border border-slate-600 transition-colors"
         >
            <HelpCircle className="w-4 h-4 mr-2" />
            {showTheory ? "Hide Requirements" : "View Logic Theory"}
            {showTheory ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
         </button>
       </div>
       
       <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-x-auto custom-scrollbar">
          <span className="text-slate-400 font-bold text-sm uppercase tracking-wider shrink-0">Animation Speed:</span>
          <div className="flex gap-2">
            <button onClick={() => setPlaySpeed(1200)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${playSpeed === 1200 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Slow</button>
            <button onClick={() => setPlaySpeed(800)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${playSpeed === 800 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Medium</button>
            <button onClick={() => setPlaySpeed(300)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${playSpeed === 300 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Fast</button>
          </div>
       </div>
       
       <AnimatePresence>
         {showTheory && (
            <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="overflow-hidden"
            >
               <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg mb-2">
                   <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Wumpus Logical Boundaries</h3>
                   <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
                       <p>The agent relies purely on deductive theorem mapping to track possible dangers utilizing adjacent states.</p>
                       <ul className="list-disc ml-6 space-y-2 mt-2">
                          <li><strong>Breeze:</strong> Marks adjacent boundaries as possible <span className="text-amber-400">Pits</span>.</li>
                          <li><strong>Stench:</strong> Marks adjacent boundaries as possible <span className="text-rose-400">Wumpus</span> origins.</li>
                          <li><strong>Intersection Evaluation:</strong> Explicit overlap boundaries define true Danger securely before movement.</li>
                       </ul>
                   </div>
               </div>
            </motion.div>
         )}
       </AnimatePresence>
       
       <div className="w-full">
           <StepsPanel 
              showSteps={showSteps} setShowSteps={setShowSteps}
              currentStep={currentStep} totalSteps={Math.max(0, steps.length - 1)}
              isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying}
              onNext={() => setCurrentStep(p=>p+1)} onPrev={() => setCurrentStep(p=>p-1)}
              disableControls={steps.length === 0}
              stepDescription={steps.length > 0 && steps[currentStep] ? steps[currentStep].desc : "Configuration loaded. Map bounds secure. Ready for mapping..."}
           />
           
           {steps.length > 0 && currentStep >= 0 && currentStep <= steps.length - 1 && showSteps && (
              (() => {
                  const desc = steps[currentStep].desc;
                  let why = "Evaluating path structures tracking map boundaries";
                  let thinking = "Tracing matrix safely minimizing exposure";
                  if (desc.includes("percepts")) { why = "No danger detected in current cell"; thinking = "All adjacent cells are guaranteed safe to explore completely."; }
                  else if (desc.includes("Breeze detected")) { why = "Breeze naturally indicates a nearby pit"; thinking = "Marking adjacent cells conditionally as possible pit locations."; }
                  else if (desc.includes("Stench detected")) { why = "Stench indicates presence of Wumpus nearby"; thinking = "Marking remaining neighboring cells as possible Wumpus origins."; }
                  else if (desc.includes("danger") || desc.includes("Intersection")) { why = "Constraint mapping leaves only one possible dangerous sector"; thinking = "Marking specific cell as strictly confirmed danger and completely avoiding it."; }
                  else if (desc.includes("Clear cell")) { why = "Cell previously confirmed strictly safe"; thinking = "Expanding safely entirely without risk parameters."; }
                  else if (desc.includes("back") || desc.includes("risk")) { why = "No safe unexplored cells immediately available"; thinking = "Forced backtracking structurally returning to safe zones evaluating alternates."; }
                  else if (desc.includes("Gold") || desc.includes("Mission")) { why = "Safe path successfully leads to target objective"; thinking = "Following mathematically safest known route extracting payload."; }
                  else if (currentStep === 0) { why = "Entry origin node established centrally"; thinking = "Defining [0,0] as an absolute safety constraint explicitly starting mapping."; }
                  
                  return (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-fade-in fade-in transition">
                         <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                             <span className="block text-[10px] tracking-widest uppercase text-indigo-400 font-bold mb-1">Why this move?</span>
                             <p className="text-sm text-slate-300">{why}</p>
                         </div>
                         <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                             <span className="block text-[10px] tracking-widest uppercase text-emerald-400 font-bold mb-1">What AI is thinking</span>
                             <p className="text-sm text-slate-300">{thinking}</p>
                         </div>
                    </div>
                  );
              })()
           )}
        </div>

       <div className="flex flex-col xl:flex-row gap-8">
          <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center">
              <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-6 w-full text-center">Environment Map</h3>
              
              {renderGrid()}

              <div className="mt-8 flex flex-wrap sm:flex-nowrap gap-4 w-full justify-center">
                  <button
                    onClick={handleRandomize}
                    disabled={isAutoPlaying}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[11px] sm:text-xs uppercase"
                  >
                    <RefreshCw className="w-4 h-4" /> Randomize World
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isAutoPlaying || steps.length === 0}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[11px] sm:text-xs uppercase"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Steps
                  </button>
                  <button
                    onClick={handleSolve}
                    disabled={isAutoPlaying || steps.length > 0 || errorMsg !== ""}
                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[11px] sm:text-xs uppercase"
                  >
                    <Settings className="w-4 h-4 " /> Execute Solver
                  </button>
              </div>
          </div>
          
          <div className="w-full xl:w-1/3 flex flex-col gap-6">
              <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700">
                  <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4">
                     Demonstration Matrix
                  </h3>
                  <div className="flex flex-col gap-4 text-sm text-slate-300">
                      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                         <strong className="block text-indigo-400 mb-2 font-bold uppercase tracking-wider text-[10px]">Test Scenario Override</strong>
                         <select 
                            value={mode === 'RANDOM' ? -1 : worldIndex} 
                            onChange={handlePredefinedChange} 
                            disabled={isAutoPlaying}
                            className="w-full bg-slate-800 text-slate-200 text-sm p-2 rounded border border-slate-600 outline-none focus:border-indigo-500 transition-colors"
                         >
                            <option value={-1}>Random Evaluator</option>
                            {PREDEFINED_WORLDS.map((_, i) => (
                               <option key={`def-${i}`} value={i}>Demo World Alpha-{i+1}</option>
                            ))}
                         </select>
                         <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Overrides dynamic map bounds ensuring specific demonstration criteria.</p>
                      </div>
                  </div>
              </div>
              
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex-1 min-h-[300px] flex flex-col">
                  <h3 className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-4">Inference Log</h3>
                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                      {steps.length > 0 ? steps.slice(0, currentStep + 1).map((s, i) => (
                          <div key={i} className={`p-3 text-sm font-bold border rounded-lg flex flex-col gap-1 ${s.success ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300 shadow-md' : s.failed ? 'bg-rose-900/50 border-rose-500 text-rose-300 shadow-md' : i === currentStep ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                              <span className="text-[10px] tracking-widest uppercase opacity-60">Step {i}</span>
                              <span>{s.desc}</span>
                          </div>
                      )) : (
                          <div className="h-full flex items-center justify-center text-slate-500 text-sm italic text-center px-4">
                              Compute matrices safely rendering topological bounds mapping.
                          </div>
                      )}
                  </div>
              </div>
          </div>
       </div>
     </div>
   );
}
