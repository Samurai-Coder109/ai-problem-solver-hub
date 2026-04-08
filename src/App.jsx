import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TicTacToe from './components/TicTacToe';
import Puzzle8 from './components/Puzzle8';
import Missionaries from './components/Missionaries';
import TSP from './components/TSP';
import Pathfinding from './components/Pathfinding';

import WumpusWorld from './components/WumpusWorld';
import BlockWorld from './components/BlockWorld';
import Learn from './components/Learn';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/8-puzzle" element={<Puzzle8 />} />
            <Route path="/missionaries" element={<Missionaries />} />
            <Route path="/tsp" element={<TSP />} />
            <Route path="/pathfinding" element={<Pathfinding />} />

            <Route path="/wumpus-world" element={<WumpusWorld />} />
            <Route path="/block-world" element={<BlockWorld />} />
            <Route path="/learn" element={<Learn />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
