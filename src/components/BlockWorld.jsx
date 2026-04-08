import React, { useState } from 'react';
import { solveBlockWorld } from '../algorithms/blockworld';
import StepsPanel from './StepsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw, Box, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const BLOCKS = ['A', 'B', 'C', 'D', 'E'];

const FIXED_GOAL = { A: 'B', B: 'C', C: 'D', D: 'E', E: 'table' };

export default function BlockWorld() {
  const genRandomStack = () => {
      let c = {};
      let freeBlocks = [...BLOCKS];
      
      // Shuffle freeBlocks
      for (let i = freeBlocks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [freeBlocks[i], freeBlocks[j]] = [freeBlocks[j], freeBlocks[i]];
      }
      
      let placedBlocks = [];
      
      while(freeBlocks.length > 0) {
          const b = freeBlocks.pop();
          // A valid base is either the table OR a placed block that has NO OTHER block resting on it.
          const validBases = ['table', ...placedBlocks.filter(bk => !Object.values(c).includes(bk))];
          
          c[b] = validBases[Math.floor(Math.random() * validBases.length)];
          placedBlocks.push(b);
      }
      
      console.log("Generated State:", c);
      return c;
  };

  const [userInput, setUserInput] = useState("");
  const [userGoalSeq, setUserGoalSeq] = useState([]);
  
  const parseTargetSequence = (seq) => {
      let config = {};
      for (let i = 0; i < seq.length; i++) {
          if (i === seq.length - 1) config[seq[i]] = 'table';
          else config[seq[i]] = seq[i+1];
      }
      return config;
  };
  
  const parseUserInput = (inputStr) => {
      try {
          const validJsonStr = inputStr.replace(/'/g, '"');
          const parsed = JSON.parse(validJsonStr);
          let arrs = Array.isArray(parsed[0]) ? parsed : [parsed];
          
          let flat = [];
          for (let arr of arrs) {
              if (!Array.isArray(arr)) return null;
              flat.push(...arr);
          }
          if (flat.length !== 5) return null;
          let dup = new Set(flat);
          if (dup.size !== 5) return null;
          for (let b of flat) {
             if (!BLOCKS.includes(b)) return null;
          }
          
          let config = {};
          for (let arr of arrs) {
              for (let i = 0; i < arr.length; i++) {
                 if (i === arr.length - 1) {
                     config[arr[i]] = 'table';
                 } else {
                     config[arr[i]] = arr[i+1];
                 }
              }
          }
          return config;
      } catch (e) {
          return null;
      }
  };

  const currentValidConfig = userInput.trim() === "" ? FIXED_GOAL : (parseUserInput(userInput) || FIXED_GOAL);
  
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(800);
  const [showTheory, setShowTheory] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
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

  const validateConfig = (config) => {
      // no loops, no multiple blocks on same base
      const bases = Object.values(config).filter(v => v !== 'table');
      const uniqueBases = new Set(bases);
      if (bases.length !== uniqueBases.size) return false;
      return true; // simple validation
  };

  const handleRandomize = () => {
      const stateObj = genRandomStack();
      let tableBlocks = BLOCKS.filter(b => stateObj[b] === 'table');
      let arrs = [];
      for (let tb of tableBlocks) {
          let stack = [tb];
          let currentTop = tb;
          while (true) {
              let nextBlock = BLOCKS.find(b => stateObj[b] === currentTop);
              if (nextBlock) { 
                  stack.unshift(nextBlock); 
                  currentTop = nextBlock; 
              } else break;
          }
          arrs.push(stack);
      }
      let str = arrs.length === 1 ? JSON.stringify(arrs[0]) : JSON.stringify(arrs);
      
      setUserInput(str);
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
  
  const handleSolve = () => {
     let configToSolve = FIXED_GOAL;
     if (userInput.trim() !== "") {
         const parsed = parseUserInput(userInput);
         if (!parsed) {
             setErrorMsg("Invalid configuration. Please use all blocks A\u2013E exactly once.");
             return;
         }
         configToSolve = parsed;
     }

     let activeGoalConfig = FIXED_GOAL;
     if (userGoalSeq.length > 0) {
         if (userGoalSeq.length !== 5) {
             setErrorMsg("Invalid target state. Please select all 5 blocks A\u2013E.");
             return;
         }
         activeGoalConfig = parseTargetSequence(userGoalSeq);
     }

     if (!validateConfig(configToSolve) || !validateConfig(activeGoalConfig)) {
         setErrorMsg("Invalid configuration! Ensure blocks form valid stacks.");
         return;
     }

     const resPath = solveBlockWorld(configToSolve, activeGoalConfig);
     if (resPath.length === 0 && JSON.stringify(configToSolve) !== JSON.stringify(activeGoalConfig)) {
         setErrorMsg("Simulation impossible or too complex.");
         return;
     }
     
     setErrorMsg("");
     setSteps([{
         action: "Initial State",
         desc: "Starting configuration loaded.",
         state: { on: configToSolve }
     }, ...resPath, {
         action: "Goal State Reached",
         desc: `The robot arm has successfully replicated the goal configuration.`,
         state: { on: activeGoalConfig },
         success: true
     }]);
     setCurrentStep(0);
     setIsAutoPlaying(true);
  };

  const renderBlocks = (stateData) => {
    if (!stateData) return null;
    const { on } = stateData;
    
    // We can infer stacks safely
    const tableBlocks = BLOCKS.filter(b => on[b] === 'table');
    
    return (
        <div className="w-full h-auto min-h-[500px] bg-slate-900 border-b-8 border-slate-600 rounded-xl relative flex items-end justify-center gap-4 sm:gap-8 p-4 pt-16 overflow-y-auto custom-scrollbar">
            {tableBlocks.map(tb => {
               // build stack for this table block safely tracking visited to avoid inf loop on user glitch
               let stack = [tb];
               let currentTop = tb;
               let visited = new Set([tb]);
               
               while (true) {
                   let nextBlock = BLOCKS.find(b => on[b] === currentTop);
                   if (nextBlock && !visited.has(nextBlock)) { 
                       stack.push(nextBlock); 
                       visited.add(nextBlock);
                       currentTop = nextBlock; 
                   } else break;
               }
               
               return (
                   <div key={`stack-${tb}`} className="flex flex-col-reverse justify-end gap-1 relative px-2">
                       {stack.map((b, i) => (
                           <motion.div 
                              layoutId={`block-viz-${b}`}
                              key={b} 
                              initial={{ opacity: 0, y: -20 }} 
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              className={`w-14 h-14 sm:w-16 sm:h-16 ${b === 'A' ? 'bg-blue-600' : b === 'B' ? 'bg-purple-600' : b === 'C' ? 'bg-rose-600' : b === 'D' ? 'bg-amber-600' : 'bg-emerald-600'} border-2 border-white/20 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center font-bold text-2xl text-white select-none relative z-10`}
                           >
                              {b}
                           </motion.div>
                       ))}
                   </div>
               )
            })}
            
            {/* Robot arm / track action */}
            <div className="absolute top-0 w-full flex justify-center">
                <div className="w-8 h-8 rounded-b-xl relative shadow-lg bg-slate-400 border border-slate-500 flex items-center justify-center">
                    <div className="w-1 h-32 absolute top-0 bg-slate-600 -z-10 bg-[linear-gradient(90deg,transparent_2px,#475569_2px,#475569_4px)] bg-[length:6px_100%]"></div>
                </div>
            </div>
        </div>
    );
  };

  // Manual config disabled.

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in fade-in transition duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center">
             <Box className="mr-3 h-6 w-6 text-amber-500" />
             Blocks World Planner
          </h1>
          <p className="text-slate-400 mt-1">A classic AI planning problem resolving initial states into goal states via BFS or Means-End analysis.</p>
        </div>
        <button 
           onClick={() => setShowTheory(!showTheory)}
           className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-bold border border-slate-600 transition-colors"
        >
           <HelpCircle className="w-4 h-4 mr-2" />
           {showTheory ? "Hide Setup" : "View Explanation Panel"}
           {showTheory ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </button>
      </div>
      
      {/* Speed Control */}
      <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
         <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">Animation Speed:</span>
         <button onClick={() => setPlaySpeed(1200)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${playSpeed === 1200 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Slow</button>
         <button onClick={() => setPlaySpeed(800)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${playSpeed === 800 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Medium</button>
         <button onClick={() => setPlaySpeed(300)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${playSpeed === 300 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Fast</button>
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
                  <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Block World Problem</h3>
                  <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
                      <p><strong>Goal:</strong> Transform the initial configuration of blocks into the specified goal configuration safely.</p>
                      <p><strong>Rules:</strong></p>
                      <ul className="list-disc ml-6 space-y-1">
                         <li>Only one block can be moved at a time.</li>
                         <li>A block can only be moved if it is "clear" (no other block is stacked on top of it).</li>
                         <li>A block can be placed onto the table or onto another "clear" block.</li>
                      </ul>
                      <p><strong>Planning Algorithm:</strong> Our backend implements a BFS (Breadth-First Search) planner ensuring the minimal amount of pick-and-place instructions is formulated.</p>
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
            stepDescription={steps.length > 0 && steps[currentStep] ? steps[currentStep].desc : "Configure blocks and hit Solve to generate planning trace."}
         />
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
         <div className="w-full xl:w-2/3 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
             <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-4 text-center">Simulation Scene</h3>
             
             {errorMsg && <div className="text-rose-400 text-sm font-bold text-center mb-4 bg-rose-500/10 p-2 rounded border border-rose-500/50">{errorMsg}</div>}
             
             {renderBlocks(steps.length > 0 ? steps[currentStep].state : { on: currentValidConfig })}

             <div className="mt-8 flex gap-4 w-full">
                 <button
                   onClick={handleRandomize}
                   disabled={isAutoPlaying}
                   className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase"
                 >
                   <RefreshCw className="w-4 h-4" /> Randomize Config
                 </button>
                 <button
                   onClick={handleReset}
                   disabled={isAutoPlaying || steps.length === 0}
                   className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase"
                 >
                   Reset Step Log
                 </button>
                 <button
                   onClick={handleSolve}
                   disabled={isAutoPlaying || steps.length > 0}
                   className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase"
                 >
                   <Settings className="w-4 h-4" /> Generate & Solve
                 </button>
             </div>
         </div>
         
         <div className="w-full xl:w-1/3 flex flex-col gap-6">
             <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700">
                 <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4">
                    Environment Parameters
                 </h3>
                 <div className="flex flex-col gap-4 text-sm text-slate-300">
                     <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <strong className="block text-indigo-400 mb-2 font-bold uppercase tracking-wider text-[10px]">Initial State</strong>
                        <input 
                           type="text" 
                           value={userInput} 
                           onChange={(e) => setUserInput(e.target.value)} 
                           placeholder='e.g. ["A", "B", "C", "D", "E"]'
                           className="w-full bg-slate-800 text-slate-200 text-sm p-2 rounded border border-slate-600 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600/50"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Format: <span className="text-slate-400">["A","B","C","D","E"]</span><br/>Leave blank for default ABCDE stack.</p>
                     </div>
                     <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                           <strong className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">Target Goal State</strong>
                           {userGoalSeq.length > 0 && (
                               <button 
                                  onClick={() => setUserGoalSeq([])} 
                                  disabled={isAutoPlaying}
                                  className="text-[9px] px-2 py-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white rounded text-slate-400 uppercase font-bold transition-colors"
                               >
                                  Reset Final State
                               </button>
                           )}
                        </div>
                        <div className="flex gap-2 mb-3">
                            {BLOCKS.map(b => (
                                <button 
                                   key={`goal-${b}`}
                                   onClick={() => {
                                      if (!userGoalSeq.includes(b)) setUserGoalSeq([...userGoalSeq, b]);
                                   }}
                                   disabled={userGoalSeq.includes(b) || isAutoPlaying || userGoalSeq.length >= 5}
                                   className={`w-8 h-8 rounded font-black text-sm flex items-center justify-center transition-all ${userGoalSeq.includes(b) ? 'bg-indigo-900/50 text-indigo-400/50 border-indigo-500/20 shadow-inner cursor-not-allowed' : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-indigo-400 hover:text-white shadow-sm'}`}
                                >
                                   {b}
                                </button>
                            ))}
                        </div>
                        <div className="opacity-80 leading-relaxed text-xs">
                          {userGoalSeq.length === 0 ? (
                             <p className="text-slate-400 font-normal italic">Default: A → B → C → D → E</p>
                          ) : (
                             <p className="font-bold">
                               <span className="text-slate-500 font-normal italic mr-2">Selection:</span>
                               <span className="text-indigo-300 tracking-widest">{userGoalSeq.join(' → ')}</span>
                             </p>
                          )}
                        </div>
                     </div>
                 </div>
             </div>
             
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex-1 min-h-[300px] flex flex-col">
                 <h3 className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-4">Planning Trace Log</h3>
                 <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                     {steps.length > 0 ? steps.slice(0, currentStep + 1).map((s, i) => (
                         <div key={i} className={`p-3 text-sm font-bold border rounded-lg flex flex-col gap-1 ${s.success ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300 shadow-md' : i === currentStep ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                             <span className="text-[10px] tracking-widest uppercase opacity-60">Step {i}</span>
                             <span>{s.action}</span>
                         </div>
                     )) : (
                         <div className="h-full flex items-center justify-center text-slate-500 text-sm italic text-center px-4">
                             Configure matrices and hit Generate to produce safe robot arms commands.
                         </div>
                     )}
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}
