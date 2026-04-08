import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid3X3, Puzzle, Navigation, Waypoints, BrainCircuit, ChevronRight, Hexagon, Box } from 'lucide-react';

const problems = [
  {
    path: '/tic-tac-toe',
    title: 'Tic-Tac-Toe AI',
    algo: 'Minimax',
    desc: 'An AI that never loses using adversarial search to predict all possible futures.',
    icon: Grid3X3,
    light: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30'
  },
  {
    path: '/8-puzzle',
    title: '8 Puzzle Solver',
    algo: 'A* Search',
    desc: 'Find the optimal sequence of moves to solve a sliding tile puzzle using heuristics.',
    icon: Puzzle,
    light: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30'
  },
  {
    path: '/missionaries',
    title: 'Missionaries & Cannibals',
    algo: 'BFS',
    desc: 'A state-space search game tracing a safe path using level-order exploration.',
    icon: Waypoints,
    light: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  {
    path: '/tsp',
    title: 'Travelling Salesman',
    algo: 'Nearest Neighbor',
    desc: 'An optimization problem approximating the shortest possible route visiting all cities.',
    icon: Navigation,
    light: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  {
    path: '/learn',
    title: 'Learn AI Algorithms',
    algo: 'Educational Hub',
    desc: 'Understand the core logical foundations, inference logic, and search methodologies empowering the intelligence of this suite.',
    icon: BrainCircuit,
    light: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30'
  }
];

const reasoningProblems = [
  {
    path: '/wumpus-world',
    title: 'Wumpus World',
    algo: 'Propositional Logic',
    desc: 'Watch an agent use inferred safe zones to survive a dangerous cavern.',
    icon: Hexagon,
    light: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/30'
  },
  {
    path: '/block-world',
    title: 'Block World Problem',
    algo: 'Means-End Analysis',
    desc: 'A step-by-step physical planning agent deriving a safe way to stack blocks.',
    icon: Box,
    light: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="py-12 px-4 selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] -z-10 rounded-full"></div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mb-8 shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50"
        >
          <BrainCircuit className="h-10 w-10 text-white" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight"
        >
          Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400">AI Problem Solver Hub</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed"
        >
          Interact, and visualize classical Artificial Intelligence problems. Discover how state-space search and heuristic algorithms solve complex puzzles efficiently.
        </motion.p>
      </div>

      <h2 className="text-3xl font-black text-white px-4 mb-6 max-w-6xl mx-auto tracking-tight border-b border-slate-700 pb-4 mt-8">Search Constraints & Pathfinding</h2>
      {/* Grid Iteration */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {problems.map((prob) => {
          const Icon = prob.icon;
          return (
            <motion.div
              key={prob.path}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(prob.path)}
              className={`bg-slate-800/50 rounded-2xl border ${prob.border} hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group backdrop-blur-sm`}
            >
              <div className="p-8 flex flex-col h-full bg-slate-800/40 hover:bg-slate-800/80 transition-colors">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${prob.light} group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
                  <Icon className={`h-8 w-8 ${prob.text} drop-shadow-[0_0_10px_currentColor]`} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
                  {prob.title}
                </h2>
                
                <div className="mb-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600 shadow-sm uppercase tracking-wide">
                    {prob.algo}
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm flex-1 mb-8 leading-relaxed font-medium">
                  {prob.desc}
                </p>
                
                <div className="mt-auto flex items-center text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                  Execute Algorithm <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      <h2 className="text-3xl font-black text-white px-4 mb-6 mt-16 max-w-6xl mx-auto tracking-tight border-b border-slate-700 pb-4">🧠 Reasoning & Planning Module</h2>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12"
      >
        {reasoningProblems.map((prob) => {
          const Icon = prob.icon;
          return (
            <motion.div
              key={prob.path}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(prob.path)}
              className={`bg-slate-800/50 rounded-2xl border ${prob.border} hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group backdrop-blur-sm`}
            >
              <div className="p-8 flex flex-col h-full bg-slate-800/40 hover:bg-slate-800/80 transition-colors">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${prob.light} group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
                  <Icon className={`h-8 w-8 ${prob.text} drop-shadow-[0_0_10px_currentColor]`} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
                  {prob.title}
                </h2>
                
                <div className="mb-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600 shadow-sm uppercase tracking-wide">
                    {prob.algo}
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm flex-1 mb-8 leading-relaxed font-medium">
                  {prob.desc}
                </p>
                
                <div className="mt-auto flex items-center text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
                  Execute Algorithm <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
