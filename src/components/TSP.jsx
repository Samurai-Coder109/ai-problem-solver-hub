import React, { useState, useRef, useEffect } from 'react';
import { solveTSPNearestNeighbor, getEuclideanDistance as calculateDistance } from '../algorithms/tsp';
import Metrics from './Metrics';
import StepsPanel from './StepsPanel';
import { Network, MousePointerClick, RefreshCcw, Navigation, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TSP() {
  const [cities, setCities] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [metrics, setMetrics] = useState({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  const [errorMsg, setErrorMsg] = useState('');
  
  // Step visualization
  const [solutionPath, setSolutionPath] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const svgRef = useRef(null);

  // Auto-playing logic
  useEffect(() => {
    let timer;
    if (isAutoPlaying && currentStep < solutionPath.length - 1) {
        timer = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, 500);
    } else if (isAutoPlaying && currentStep >= solutionPath.length - 1) {
        setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStep, solutionPath]);

  const handleSVGClick = (e) => {
    if (isSolving || solutionPath.length > 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Labels array matching to node index (0 -> A, 25 -> Z, etc.)
    const label = String.fromCharCode(65 + cities.length);
    setCities([...cities, { x, y, label }]);
  };

  const handleGenerateRandom = () => {
    if (isSolving) return;
    handleClear();
    const newCities = [];
    const width = svgRef.current ? svgRef.current.clientWidth : 500;
    const height = svgRef.current ? svgRef.current.clientHeight : 400;
    
    for (let i = 0; i < 10; i++) {
      newCities.push({
        x: Math.max(30, Math.random() * (width - 30)),
        y: Math.max(30, Math.random() * (height - 30)),
        label: String.fromCharCode(65 + i)
      });
    }
    setCities(newCities);
  };

  const handleSolve = () => {
    if (cities.length < 3) {
      setErrorMsg('Please add at least 3 cities.');
      return;
    }
    setErrorMsg('Calculating shortest route...');
    setIsSolving(true);

    setTimeout(() => {
      const result = solveTSPNearestNeighbor(cities);
      if (result.error) {
        setErrorMsg('Error: ' + result.error);
        setIsSolving(false);
        return;
      }

      setErrorMsg('');
      setMetrics({
        nodesExplored: result.nodesExplored,
        timeTaken: result.timeTaken,
        pathLength: Math.round(result.totalDistance)
      });
      
      const pathIndices = result.path.map(c => cities.findIndex(city => city.x === c.x && city.y === c.y));
      setSolutionPath(pathIndices);
      setCurrentStep(0);
      setIsAutoPlaying(true);
      setIsSolving(false);
    }, 50);
  };

  const handleClear = () => {
    setCities([]);
    setSolutionPath([]);
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setErrorMsg('');
    setMetrics({ nodesExplored: 0, timeTaken: 0, pathLength: '-' });
  };

  // Calculate "live" distance dynamically based on current selected steps
  const getCurrentDistance = () => {
    if (solutionPath.length === 0 || currentStep === 0) return 0;
    let dist = 0;
    for (let i = 0; i < currentStep; i++) {
        dist += calculateDistance(cities[solutionPath[i]], cities[solutionPath[i+1]]);
    }
    return Math.round(dist);
  };

  const getStepDescription = () => {
    if (solutionPath.length === 0) return "Add cities or generate random nodes.";
    if (currentStep === 0) return `Starting tour at City ${cities[solutionPath[0]].label}.`;
    if (currentStep === solutionPath.length - 1) return `Returned to start. Total optimally found distance: ${getCurrentDistance()}`;
    const from = cities[solutionPath[currentStep - 1]].label;
    const to = cities[solutionPath[currentStep]].label;
    const dist = Math.round(calculateDistance(cities[solutionPath[currentStep - 1]], cities[solutionPath[currentStep]]));
    return `Travelled from ${from} to ${to} (Distance: ${dist}). Current total: ${getCurrentDistance()}`;
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in fade-in transition duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Travelling Salesman</h1>
          <p className="text-slate-400 mt-1">Approximate the shortest possible route using Greedy Nearest Neighbor.</p>
        </div>
      </div>

      <div className="w-full">
         <StepsPanel 
            showSteps={showSteps} setShowSteps={setShowSteps}
            currentStep={currentStep} totalSteps={Math.max(0, solutionPath.length - 1)}
            isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying}
            onNext={() => setCurrentStep(prev => prev + 1)} 
            onPrev={() => { setIsAutoPlaying(false); setCurrentStep(prev => prev - 1); }}
            disableControls={solutionPath.length === 0 || isSolving}
            stepDescription={getStepDescription()}
         />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Graph Area */}
        <div className="flex flex-col items-center bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700 w-full lg:w-2/3 overflow-hidden">
          
          <div className="h-6 mb-6 text-sm font-semibold flex items-center w-full justify-center">
            {errorMsg ? (
              <span className={`px-4 py-1.5 rounded-full border shadow-sm ${errorMsg.includes('Error') || errorMsg.includes('Please') ? 'text-amber-400 bg-amber-400/10 border-amber-500/50' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/50 animate-pulse'}`}>
                {errorMsg}
              </span>
            ) : null}
            {!errorMsg && <div className="h-6"></div>}
          </div>

          <div
            className="w-full bg-slate-900 border-2 border-slate-700/80 rounded-2xl overflow-hidden relative shadow-inner cursor-crosshair min-h-[350px] sm:min-h-[450px]"
            onClick={handleSVGClick}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            {cities.length === 0 && !isSolving && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none p-4 text-center z-0">
                <MousePointerClick className="h-10 w-10 mb-3 opacity-50" />
                <p>Click anywhere to create cities</p>
                <p className="text-xs mt-2 opacity-70">or click "Random 10" below</p>
              </div>
            )}

            <svg ref={svgRef} className="w-full h-full min-h-[350px] sm:min-h-[450px] relative z-10 transition-all">
              
              {/* Draw complete but translucent faint lines for all subpaths to see graph context */}
              {cities.length > 2 && solutionPath.length === 0 && cities.map((c1, i) => 
                cities.map((c2, j) => {
                   if (i >= j) return null;
                   return <line key={`${i}-${j}`} x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />;
                })
              )}

              {/* Draw established path lines by iterating up to current step */}
              {solutionPath.length > 0 && Array.from({ length: currentStep }).map((_, i) => {
                const fromIdx = solutionPath[i];
                const toIdx = solutionPath[i + 1];
                if (fromIdx === undefined || toIdx === undefined) return null;
                const c1 = cities[fromIdx];
                const c2 = cities[toIdx];
                const isHighlightEdge = (i === currentStep - 1);
                
                return (
                  <motion.line
                    key={`path-${i}`}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                    x1={c1.x}
                    y1={c1.y}
                    x2={c2.x}
                    y2={c2.y}
                    stroke={isHighlightEdge ? "rgba(56, 189, 248, 1)" : "rgba(129, 140, 248, 0.4)"} // Highlight current edge directly cyan
                    strokeWidth={isHighlightEdge ? "4" : "2"}
                    strokeLinecap="round"
                    style={{ filter: isHighlightEdge ? "drop-shadow(0 0 5px rgba(56,189,248,0.8))" : "none" }}
                  />
                );
              })}

              {/* Draw Cities */}
              {cities.map((city, index) => {
                const isStartNode = solutionPath.length > 0 && solutionPath[0] === index;
                const isVisitedNode = solutionPath.slice(0, currentStep + 1).includes(index);
                const isCurrentNode = solutionPath[currentStep] === index;

                return (
                  <g key={`node-${index}`} transform={`translate(${city.x},${city.y})`} className="transition-transform">
                    <circle
                      r="12"
                      fill={isCurrentNode ? "#0ea5e9" : isVisitedNode ? "#818cf8" : "#e2e8f0"} // Current=Cyan, Visited=Indigo, Normal=White
                      className="${isCurrentNode ? 'animate-pulse' : ''}"
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                    <text 
                      x="0" 
                      y="1" 
                      className="text-xs font-bold" 
                      fill="#0f172a" 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      style={{ pointerEvents: 'none' }}
                    >
                      {city.label}
                    </text>
                    {isStartNode && (
                      <text x="0" y="-18" className="text-[10px] font-bold" fill="#38bdf8" textAnchor="middle">
                        START
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap gap-4 mt-8 justify-center w-full relative z-10">
            <button
              onClick={handleGenerateRandom}
              disabled={isSolving || solutionPath.length > 0}
              className="flex items-center px-4 sm:px-6 py-2.5 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 rounded-xl shadow-md transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <RefreshCcw className="h-4 w-4 mr-2" strokeWidth={2.5}/> Random 10
            </button>
            <button
              onClick={handleClear}
              className="flex items-center px-4 sm:px-6 py-2.5 bg-slate-900 border border-rose-500/50 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all duration-200 active:scale-95 font-bold tracking-wide uppercase text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleSolve}
              disabled={isSolving || solutionPath.length > 0 || cities.length < 3}
              className="flex items-center px-4 sm:px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-200 active:scale-95 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
            >
              <Navigation className="h-4 w-4 mr-2" strokeWidth={2.5}/> Solve
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="w-full lg:w-1/3 flex-1 flex flex-col gap-6">
          <Metrics 
            timeTaken={metrics.timeTaken}
            nodesExplored={metrics.nodesExplored}
            algorithm="Nearest Neighbor"
            customLabel1="Current Distance"
            customValue1={solutionPath.length > 0 ? getCurrentDistance() : '-'}
          />
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center tracking-tight">
               <Network className="h-6 w-6 mr-3 text-indigo-400"/> TSP Heuristics
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed space-y-3 font-medium">
              <span><strong>Nearest Neighbor</strong> is a greedy algorithm. It starts at an arbitrary city and repeatedly visits the closest unvisited city until all cities are visited.</span>
              <br/><br/>
              <span>While it does not guarantee the optimal true shortest global route, it computes a highly effective approximate path in a fraction of the time brute-force evaluation would require!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
