import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid3X3, Puzzle, Navigation, Waypoints, BrainCircuit, Hexagon, Box, BookOpen } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/tic-tac-toe', label: 'Tic-Tac-Toe', icon: Grid3X3 },
    { path: '/8-puzzle', label: '8 Puzzle', icon: Puzzle },
    { path: '/missionaries', label: 'Missionaries', icon: Waypoints },
    { path: '/tsp', label: 'TSP', icon: Navigation },
    
    { path: '/wumpus-world', label: 'Wumpus', icon: Hexagon },
    { path: '/block-world', label: 'Blocks', icon: Box },
    { path: '/learn', label: 'Learn AI', icon: BrainCircuit },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center shrink-0">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-slate-100 tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                AI Solver Hub
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2 h-full items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_1px_rgba(255,255,255,0.1)] ring-1 ring-indigo-500/30'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="sm:hidden overflow-x-auto flex pb-3 px-3 shadow-inner bg-slate-900 border-t border-slate-800 items-center space-x-2 hide-scrollbar pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`mobile-${item.path}`}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap min-w-[75px] transition-all ${
                  isActive
                    ? 'text-indigo-400 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-1.5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
