import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, BrainCircuit, SearchCode, GitMerge, Map, ChevronDown, ChevronUp } from 'lucide-react';

export default function Learn() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const algorithms = [
    {
      id: 'pathfinding',
      name: 'Algorithm Visualizer',
      icon: Map,
      color: 'text-cyan-400',
      bgType: 'bg-cyan-500/10 border-cyan-500/20',
      description: 'Visualize BFS, UCS, and A* algorithms step-by-step routing organically around barriers.',
      usage: 'Used for understanding search algorithms experimentally.',
      actionPath: '/pathfinding',
      actionLabel: 'Visualize Algorithm'
    },
    {
      id: 'wumpuslogic',
      name: 'Wumpus World Logic',
      icon: Network,
      color: 'text-rose-400',
      bgType: 'bg-rose-500/10 border-rose-500/20',
      description: 'Agent uses percept-based reasoning and logical inference to safely explore environment.',
      usage: 'Uses knowledge-based reasoning. Uses percepts (Breeze -> possible pit, Stench -> possible Wumpus). Marks safe and dangerous cells utilizing intersection inference.',
      details: {
        concept: 'Knowledge-based agent reasoning under strict uncertainty.',
        how: [
            'Uses percepts: Breeze → pit nearby, Stench → Wumpus nearby',
            'Uses inference to explicitly mark safe cells',
            'Deduces and isolates dangerous cells actively'
        ],
        why: 'Demonstrates logical reasoning under uncertainty dynamically.',
        realWorld: 'Robotics navigation, Autonomous exploration operations'
      }
    },
    {
      id: 'blocklogic',
      name: 'Block World Logic',
      icon: Network,
      color: 'text-amber-400',
      bgType: 'bg-amber-500/10 border-amber-500/20',
      description: 'Block World uses state-space search to find optimal sequence of actions.',
      usage: 'Planning problem transforming initial configurations to explicitly defined goals utilizing rigorous search algorithms mapping strictly valid physical constraints safely.',
      details: {
        concept: 'Automated state-space planner evaluating discrete moves.',
        how: [
            'Formulated explicitly as a planning problem.',
            'Moves blocks validating constraints to reach goal state',
            'Uses rigorous state-space search frameworks'
        ],
        why: 'Required specifically for strict step-by-step task planning.',
        realWorld: 'Robot arm manipulation, Advanced warehouse automation'
      }
    },
    {
      id: 'bfs',
      name: 'Breadth-First Search (BFS)',
      icon: Network,
      color: 'text-indigo-400',
      bgType: 'bg-indigo-500/10 border-indigo-500/20',
      description: 'Explores nodes level by level without considering weights or heuristics. It guarantees the absolute shortest possible path in an unweighted environment.',
      usage: 'Used in this app for Wumpus World navigation paths, and commonly used in network packet routing or social network friend recommendations.',
      details: {
        concept: 'Exhaustive search algorithm mapping layers unconditionally.',
        how: [
            'Explores nodes layer by layer natively',
            'Uses queue (FIFO) architectural data structure',
            'Mathematically guarantees shortest path natively (unweighted graph)'
        ],
        why: 'When the absolute shortest path is required blindly.',
        realWorld: 'GPS navigation (basic routing algorithm structure)'
      }
    },
    {
      id: 'ucs',
      name: 'Uniform Cost Search (UCS)',
      icon: GitMerge,
      color: 'text-emerald-400',
      bgType: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Expands the lowest cumulative cost node first. Guarantees the optimal cheapest path through weighted graphs.',
      usage: 'Used in this app for basic Pathfinding, and powers systems like Google Maps routing algorithms avoiding toll roads or traffic delays.',
      details: {
        concept: 'Cost-driven pathing dynamically assessing cheapest cumulative edges.',
        how: [
            'Expands actively pending nodes with the lowest overall cost first',
            'Uses priority queue indexing',
            'Guarantees optimal path resolving purely cost'
        ],
        why: 'Required when physical edge movement costs differ dynamically.',
        realWorld: 'Complex network routing, Shipping logistics cost optimization'
      }
    },
    {
      id: 'astar',
      name: 'A* Search (A-Star)',
      icon: SearchCode,
      color: 'text-amber-400',
      bgType: 'bg-amber-500/10 border-amber-500/20',
      description: 'Combines actual distance traveled (g) with an educated logical guess of distance remaining (h). Faster and vastly more efficient than typical searches.',
      usage: 'Used in this app for 8-Puzzle solving and Pathfinding. Heavily utilized in video game AI determining rapid non-player character movements.',
      details: {
        concept: 'Heuristic-driven optimal routing engine predicting total paths.',
        how: [
            'Uses mathematical calculation: f(n) = g(n) + h(n)',
            'Combines actual cost traveled mapped completely with remaining heuristic'
        ],
        why: 'Vastly faster than UCS while offering purely efficient pathfinding natively.',
        realWorld: 'Google Maps traffic tracking, Real-time Game AI navigation'
      }
    },
    {
      id: 'minimax',
      name: 'Minimax Algorithm',
      icon: BrainCircuit,
      color: 'text-rose-400',
      bgType: 'bg-rose-500/10 border-rose-500/20',
      description: 'A recursive adversarial decision algorithm. Calculates game states all the way to absolute conclusions assuming the opponent plays perfectly.',
      usage: 'Used in this app for our unbeatable Tic-Tac-Toe AI opponent. Core mechanism used in Chess engines and classic turn-based competitive game design.',
      details: {
        concept: 'Adversarial state calculation mapping to terminal nodes logically.',
        how: [
            'Specifically used natively in adversarial games natively',
            'Algorithm systematically assumes opponent plays absolutely optimally'
        ],
        why: 'Exhaustively natively absolutely finds the best possible explicit move.',
        realWorld: 'Deep Blue Chess AI, High-level logical Strategy games'
      }
    }
  ];

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in fade-in transition duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
         <div>
           <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center">
              <BrainCircuit className="mr-3 h-6 w-6 text-indigo-400" />
              Algorithm Learning Center
           </h1>
           <p className="text-slate-400 mt-1">Discover the fundamental algorithms powering intelligent decisions and pathfinding structures internally.</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full custom-scrollbar pb-6">
        {algorithms.map(algo => {
           const Icon = algo.icon;
           return (
             <div key={algo.id} className={`flex flex-col p-6 rounded-2xl border ${algo.bgType} hover:bg-slate-800/80 transition-all shadow-md`}>
                <div className="flex items-center mb-4 border-b border-slate-700/50 pb-4">
                  <Icon className={`w-8 h-8 mr-4 ${algo.color} shrink-0`} strokeWidth={2} />
                  <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest text-sm">{algo.name}</h2>
                </div>
                <div className="flex-1 space-y-4 text-slate-300 text-sm leading-relaxed">
                  <p>{algo.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/30 flex-1 flex flex-col justify-end">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Practical Integration</p>
                    <p className="text-sm font-medium text-indigo-300/80">{algo.usage}</p>
                  </div>
                  
                  {algo.details && (
                     <div className="mt-4 w-full">
                       <button 
                         onClick={() => setExpandedId(expandedId === algo.id ? null : algo.id)}
                         className="flex items-center justify-center w-full py-2 bg-slate-800 border border-slate-600/50 hover:bg-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-all font-bold text-xs uppercase tracking-wider"
                       >
                         {expandedId === algo.id ? 'Hide Details' : 'More Details'}
                         {expandedId === algo.id ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                       </button>
                       
                       {expandedId === algo.id && (
                         <div className="mt-4 pt-4 border-t border-slate-700/50 text-sm text-slate-300 space-y-4 animate-fade-in text-left">
                            <div>
                               <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Core Concept</span>
                               <p className="leading-relaxed">{algo.details.concept}</p>
                            </div>
                            <div>
                               <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">How it Works</span>
                               <ul className="list-disc list-inside space-y-1 ml-1">
                                  {algo.details.how.map((h, i) => <li key={i}>{h}</li>)}
                               </ul>
                            </div>
                            <div>
                               <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Why it is Used</span>
                               <p className="leading-relaxed">{algo.details.why}</p>
                            </div>
                            <div>
                               <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Real-World Application</span>
                               <p className="leading-relaxed font-semibold text-slate-200">{algo.details.realWorld}</p>
                            </div>
                         </div>
                       )}
                     </div>
                  )}

                  {algo.actionPath && (
                     <button 
                        onClick={() => navigate(algo.actionPath)}
                        className="mt-4 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md active:scale-95 flex items-center justify-center border border-indigo-400/50"
                     >
                         {algo.actionLabel}
                     </button>
                  )}
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
