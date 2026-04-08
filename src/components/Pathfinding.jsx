import React, { useState, useEffect } from 'react';
import { solvePathfindingAStar as astar } from '../algorithms/astar';
import { solvePathfindingBFS as bfsGrid } from '../algorithms/bfs';
import { solvePathfindingUCS as ucs } from '../algorithms/ucs';
import Metrics from './Metrics';
import StepsPanel from './StepsPanel';
import { MousePointerClick, RefreshCcw, Navigation, Shuffle, PenTool, Flag, MapPin } from 'lucide-react';

const ROW_COUNT = 20;
const COL_COUNT = 20;

const createNode = (col, row, startNode, finishNode) => ({
  col,
  row,
  isStart: row === startNode.row && col === startNode.col,
  isFinish: row === finishNode.row && col === finishNode.col,
  distance: Infinity,
  isVisited: false,
  isWall: false,
  previousNode: null,
});

export default function Pathfinding() {
  const [startNodeLoc, setStartNodeLoc] = useState({ row: 10, col: 4 });
  const [finishNodeLoc, setFinishNodeLoc] = useState({ row: 10, col: 15 });
  
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  
  const [metrics, setMetrics] = useState({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  const [algoName, setAlgoName] = useState('A* Search');
  const [errorMsg, setErrorMsg] = useState('');

  // Step visualization
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [pathNodes, setPathNodes] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // Custom Controls
  const [speedDelay, setSpeedDelay] = useState(25); // Default to Fast (25ms)
  const [penMode, setPenMode] = useState('wall'); // 'wall', 'start', 'goal'

  const getInitialGrid = (startL, finishL) => {
    const newGrid = [];
    for (let row = 0; row < ROW_COUNT; row++) {
      const currentRow = [];
      for (let col = 0; col < COL_COUNT; col++) {
        currentRow.push(createNode(col, row, startL, finishL));
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  };

  useEffect(() => {
    setGrid(getInitialGrid(startNodeLoc, finishNodeLoc));
  }, []);

  useEffect(() => {
    let timer;
    if (isAutoPlaying && currentStep < visitedNodes.length + pathNodes.length) {
        timer = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, speedDelay); 
    } else if (isAutoPlaying) {
        setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStep, visitedNodes, pathNodes, speedDelay]);

  const updateNodeState = (row, col) => {
    if (isSolving || visitedNodes.length > 0) return;
    
    if (penMode === 'start') {
        if (row === finishNodeLoc.row && col === finishNodeLoc.col) return;
        setStartNodeLoc({ row, col });
        setGrid(prev => {
           const newGrid = getInitialGrid({row, col}, finishNodeLoc);
           // preserve walls
           for (let r=0; r<ROW_COUNT; r++){
               for (let c=0; c<COL_COUNT; c++){
                   newGrid[r][c].isWall = prev[r][c].isWall;
               }
           }
           newGrid[row][col].isWall = false;
           return newGrid;
        });
    } else if (penMode === 'goal') {
        if (row === startNodeLoc.row && col === startNodeLoc.col) return;
        setFinishNodeLoc({ row, col });
        setGrid(prev => {
           const newGrid = getInitialGrid(startNodeLoc, {row, col});
           // preserve walls
           for (let r=0; r<ROW_COUNT; r++){
               for (let c=0; c<COL_COUNT; c++){
                   newGrid[r][c].isWall = prev[r][c].isWall;
               }
           }
           newGrid[row][col].isWall = false;
           return newGrid;
        });
    } else if (penMode === 'wall') {
        const newGrid = grid.slice();
        const node = newGrid[row][col];
        if (node.isStart || node.isFinish) return;
        const newNode = {
            ...node,
            isWall: !node.isWall,
        };
        newGrid[row][col] = newNode;
        setGrid(newGrid);
    }
  };

  const handleMouseDown = (row, col) => {
    if (isSolving || visitedNodes.length > 0) return;
    setMouseIsPressed(true);
    updateNodeState(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isSolving || visitedNodes.length > 0) return;
    if (penMode === 'wall') {
       updateNodeState(row, col);
    }
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const handleRandomObstacles = () => {
    if (isSolving) return;
    clearPaths();
    
    setGrid(prev => {
        const newGrid = getInitialGrid(startNodeLoc, finishNodeLoc);
        for (let r = 0; r < ROW_COUNT; r++) {
            for (let c = 0; c < COL_COUNT; c++) {
                if (!newGrid[r][c].isStart && !newGrid[r][c].isFinish) {
                    newGrid[r][c].isWall = Math.random() < 0.25; // 25% chance
                }
            }
        }
        return newGrid;
    });
  };

  const clearGrid = () => {
    if (isSolving) return;
    setGrid(getInitialGrid(startNodeLoc, finishNodeLoc));
    clearPaths();
  };

  const clearPaths = () => {
    if (isSolving) return;
    setVisitedNodes([]);
    setPathNodes([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setErrorMsg('');
    setMetrics({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  };

  const executeAlgorithm = (algorithmFunc, name) => {
    if (isSolving) return;
    clearPaths();
    setAlgoName(name);
    setErrorMsg(`Calculating shortest path with ${name}...`);
    setIsSolving(true);

    setTimeout(() => {
      const startNode = grid[startNodeLoc.row][startNodeLoc.col];
      const finishNode = grid[finishNodeLoc.row][finishNodeLoc.col];
      
      const result = algorithmFunc(grid, startNode, finishNode);
      const visitedNodesInOrder = result.visitedNodes;
      const nodesInShortestPathOrder = result.path;

      if (!visitedNodesInOrder || visitedNodesInOrder.length === 0 || nodesInShortestPathOrder.length === 0) {
          setErrorMsg('No path found! Ensure the finish node is reachable.');
          setIsSolving(false);
          // We can still visualize explored nodes!
          if (visitedNodesInOrder && visitedNodesInOrder.length > 0) {
             setMetrics({
               nodesExplored: result.nodesExplored,
               timeTaken: result.timeTaken,
               pathLength: 0
             });
             setVisitedNodes(visitedNodesInOrder);
             setPathNodes([]);
             setCurrentStep(0);
             setIsAutoPlaying(true);
          }
          return;
      }

      setErrorMsg('');
      setMetrics({
        nodesExplored: result.nodesExplored,
        timeTaken: result.timeTaken,
        pathLength: Math.max(0, nodesInShortestPathOrder.length - 1)
      });
      
      setVisitedNodes(visitedNodesInOrder);
      setPathNodes(nodesInShortestPathOrder);
      setCurrentStep(0);
      setIsSolving(false);
      setIsAutoPlaying(true);
    }, 50);
  };

  const getStepDescription = () => {
    if (visitedNodes.length === 0) return "Configure the grid, then select an algorithm below.";
    if (currentStep < visitedNodes.length) {
        const node = visitedNodes[currentStep];
        return `Algorithm exploring node at [Row: ${node.row}, Col: ${node.col}]`;
    } else {
        const idx = currentStep - visitedNodes.length;
        if (idx >= pathNodes.length && pathNodes.length > 0) return "Optimal path found and highlighted!";
        if (pathNodes.length === 0) return "Grid fully explored. No path exists.";
        return `Tracing optimal shortest path connection.`;
    }
  };

  const getNodeClass = (node) => {
    const { col, row, isStart, isFinish, isWall } = node;
    const isNodeVisitedArr = visitedNodes.findIndex(n => n.row === row && n.col === col);
    const isNodeInPathArr = pathNodes.findIndex(n => n.row === row && n.col === col);
    
    const isVisitedActive = isNodeVisitedArr !== -1 && isNodeVisitedArr <= currentStep;
    const isPathActive = isNodeInPathArr !== -1 && (currentStep - visitedNodes.length >= isNodeInPathArr);

    if (isStart) return "bg-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20 border-[2px] border-emerald-300";
    if (isFinish) return "bg-rose-500 scale-105 shadow-[0_0_15px_rgba(244,63,94,0.8)] z-20 border-[2px] border-rose-300";
    if (isWall) return "bg-slate-700 border border-slate-900 shadow-inner";
    
    if (isPathActive) return "bg-amber-400 node-path shadow-[0_0_10px_rgba(251,191,36,0.5)] z-10 border-amber-600";
    if (isVisitedActive) return "bg-blue-500/60 node-visited border-blue-400/40"; // Light blue frontier / blue visited
    
    return "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 cursor-pointer";
  };

  const totalSteps = visitedNodes.length + pathNodes.length;

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in fade-in transition duration-500" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Pathfinding Visualizer</h1>
          <p className="text-slate-400 mt-1">Fixed 20x20 Grid. Visualize how search algorithms route around physical obstacles.</p>
        </div>
        
        {/* Speed Controls Component */}
        <div className="flex bg-slate-900 rounded-xl border border-slate-700 p-1 overflow-hidden shrink-0 mt-2 md:mt-0">
           <button 
             onClick={() => setSpeedDelay(250)}
             className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${speedDelay === 250 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Slow
           </button>
           <button 
             onClick={() => setSpeedDelay(100)}
             className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${speedDelay === 100 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Medium
           </button>
           <button 
             onClick={() => setSpeedDelay(15)}
             className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${speedDelay === 15 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Fast
           </button>
        </div>
      </div>

       <div className="w-full">
         <StepsPanel 
            showSteps={showSteps} setShowSteps={setShowSteps}
            currentStep={currentStep} totalSteps={Math.max(0, totalSteps)}
            isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying}
            onNext={() => setCurrentStep(prev => prev + 1)} 
            onPrev={() => { setIsAutoPlaying(false); setCurrentStep(prev => prev - 1); }}
            disableControls={visitedNodes.length === 0 || isSolving}
            stepDescription={getStepDescription()}
         />
         
         {visitedNodes.length > 0 && currentStep > 0 && currentStep <= totalSteps && showSteps && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-fade-in fade-in transition">
                 <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                     <span className="block text-[10px] tracking-widest uppercase text-indigo-400 font-bold mb-1">Why this move?</span>
                     <p className="text-sm text-slate-300">
                         {algoName === 'Breadth First' ? 'Exploring level-wise nodes unconditionally.' : 
                          algoName === 'Uniform Cost' ? 'Lowest cumulative path cost mathematically.' : 
                          'Lowest f(n) = g(n) + h(n) combined score.'}
                     </p>
                 </div>
                 <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm">
                     <span className="block text-[10px] tracking-widest uppercase text-emerald-400 font-bold mb-1">What AI is thinking</span>
                     <p className="text-sm text-slate-300">
                         {algoName === 'Breadth First' ? 'Expanding all neighbors equally searching blindly.' : 
                          algoName === 'Uniform Cost' ? 'Prioritizing cheapest route mapped so far.' : 
                          'Choosing optimal estimated path using A* heuristics.'}
                     </p>
                 </div>
            </div>
         )}
       </div>

      <div className="flex flex-col gap-6 items-center w-full">
        
        <div className="h-6 text-sm font-semibold flex items-center w-full justify-center">
            {errorMsg ? (
              <span className={`px-4 py-1.5 rounded-full border shadow-sm ${errorMsg.includes('No path') ? 'text-amber-400 bg-amber-400/10 border-amber-500/50' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/50 animate-pulse'}`}>
                {errorMsg}
              </span>
            ) : null}
            {!errorMsg && <div className="h-6"></div>}
        </div>

        <div className="flex flex-col xl:flex-row gap-8 w-full justify-center items-start">
            
            {/* Left Controls */}
            <div className="w-full xl:w-64 flex flex-col gap-4 bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-xl shrink-0">
               
               <div className="text-xs uppercase font-black text-slate-500 mb-2 tracking-widest text-center xl:text-left">Grid Controls</div>
               
               <div className="flex flex-row xl:flex-col gap-2 flex-wrap justify-center">
                   <button 
                     onClick={() => setPenMode('wall')}
                     className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${penMode === 'wall' ? 'bg-slate-700 text-white border-2 border-indigo-500' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                     title="Drag mouse to draw/erase walls"
                   >
                     <PenTool className="h-4 w-4 mr-3 text-slate-400" /> Draw Walls
                   </button>
                   
                   <button 
                     onClick={() => setPenMode('start')}
                     className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${penMode === 'start' ? 'bg-slate-700 text-white border-2 border-emerald-500' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                     title="Click any cell to set as Start"
                   >
                     <MapPin className="h-4 w-4 mr-3 text-emerald-400" /> Set Start
                   </button>
                   
                   <button 
                     onClick={() => setPenMode('goal')}
                     className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${penMode === 'goal' ? 'bg-slate-700 text-white border-2 border-rose-500' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                     title="Click any cell to set as Goal"
                   >
                     <Flag className="h-4 w-4 mr-3 text-rose-400" /> Set Goal
                   </button>
               </div>
               
               <hr className="border-slate-700 my-2" />
               
               <button
                  onClick={handleRandomObstacles}
                  disabled={isSolving || visitedNodes.length > 0}
                  className="flex items-center justify-center px-4 py-3 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 rounded-xl shadow-md transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  <Shuffle className="h-4 w-4 mr-2 text-amber-400" strokeWidth={3}/> Random Maze
               </button>
               
               <hr className="border-slate-700 my-2" />
               
               <button
                  onClick={clearGrid}
                  disabled={isSolving}
                  className="flex items-center justify-center px-4 py-3 bg-slate-900 border border-rose-500/50 hover:bg-rose-500/10 text-rose-400 rounded-xl font-bold transition-all disabled:opacity-50 mt-2"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" strokeWidth={2}/> Clear Grid
               </button>
               
               <button
                  onClick={clearPaths}
                  disabled={isSolving || visitedNodes.length === 0}
                  className="flex items-center justify-center px-4 py-3 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all disabled:opacity-50 mt-2 shadow-sm"
                >
                  Clear Path Only
               </button>
            </div>

            {/* The Grid Area */}
            <div className="overflow-x-auto w-full flex justify-center pb-4 hide-scrollbar">
              <div 
                  className="bg-slate-900 border-4 border-slate-700 p-2 rounded-xl shadow-2xl shrink-0 flex flex-col relative"
                  style={{ gap: '2px' }}
              >
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex" style={{ gap: '2px' }}>
                    {row.map((node, nodeIdx) => {
                      const { row, col } = node;
                      return (
                        <div
                          key={`${row}-${col}`}
                          onMouseDown={(e) => { e.preventDefault(); handleMouseDown(row, col); }}
                          onMouseEnter={() => handleMouseEnter(row, col)}
                          className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-sm ${getNodeClass(node)} transition-all duration-300`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full xl:w-72 shrink-0">
                <Metrics 
                  timeTaken={metrics.timeTaken}
                  nodesExplored={metrics.nodesExplored}
                  algorithm={algoName}
                  customLabel1="Path Length"
                  customValue1={metrics.pathLength}
                />
            </div>
        </div>

        <div className="flex flex-col gap-4 mt-6 justify-center w-full bg-slate-800 p-6 border border-slate-700 rounded-2xl xl:w-auto shadow-sm">
            <div className="text-center pb-2 border-b border-slate-700/50">
              <span className="font-bold text-slate-300 text-sm">Run multiple algorithms on the same grid</span>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => executeAlgorithm(astar, 'A* Search')}
                disabled={isSolving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] active:scale-95 text-xs sm:text-sm"
              >
                A* Algorithm
              </button>
              <button
                onClick={() => executeAlgorithm(ucs, 'Uniform Cost')}
                disabled={isSolving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] active:scale-95 text-xs sm:text-sm"
              >
                UCS Algorithm
              </button>
              <button
                onClick={() => executeAlgorithm(bfsGrid, 'Breadth First')}
                disabled={isSolving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] active:scale-95 text-xs sm:text-sm"
              >
                 BFS Algorithm
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
