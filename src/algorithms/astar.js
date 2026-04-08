/**
 * src/algorithms/astar.js
 * Implements A* Search for both 8-Puzzle and Grid Pathfinding.
 */

// -----------------------------------------
// 8-PUZZLE UTILITIES
// -----------------------------------------

const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Manhattan Distance heuristic for 8-puzzle
function getManhattanDistance(state) {
  let dist = 0;
  for (let i = 0; i < state.length; i++) {
    const val = state[i];
    if (val !== 0) {
      const targetIdx = GOAL_STATE.indexOf(val);
      const targetX = targetIdx % 3;
      const targetY = Math.floor(targetIdx / 3);
      const currX = i % 3;
      const currY = Math.floor(i / 3);
      dist += Math.abs(currX - targetX) + Math.abs(currY - targetY);
    }
  }
  return dist;
}

function getNeighbors(state) {
  const neighbors = [];
  const emptyIdx = state.indexOf(0);
  const x = emptyIdx % 3;
  const y = Math.floor(emptyIdx / 3);

  const moves = [
    { dx: 0, dy: -1 }, // Up
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 }   // Right
  ];

  for (const move of moves) {
    const nx = x + move.dx;
    const ny = y + move.dy;

    if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3) {
      const newEmptyIdx = ny * 3 + nx;
      const newState = [...state];
      // Swap
      [newState[emptyIdx], newState[newEmptyIdx]] = [newState[newEmptyIdx], newState[emptyIdx]];
      neighbors.push(newState);
    }
  }
  return neighbors;
}

/**
 * Solves the 8-puzzle using A* Search.
 * @param {Array<number>} initialState 
 * @returns {Object} result 
 */
export function solve8PuzzleAStar(initialState) {
  const startT = performance.now();
  
  // A simple queue - we'll sort it dynamically
  let openList = [{
    state: initialState,
    g: 0,
    h: getManhattanDistance(initialState),
    f: getManhattanDistance(initialState),
    path: [initialState]
  }];
  
  const closedSet = new Set();
  let nodesExplored = 0;

  while (openList.length > 0) {
    // Sort by f value and grab the lowest
    // Using a basic sort instead of priority queue for simplicity in JS
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    const currentString = current.state.join(',');

    if (closedSet.has(currentString)) continue;
    
    closedSet.add(currentString);
    nodesExplored++;

    // Safety net for large trees
    if (nodesExplored > 25000) {
      const endT = performance.now();
      return { path: null, nodesExplored, timeTaken: Math.round(endT - startT), error: 'Exceeded node limit' };
    }

    // Check if goal reached
    if (getManhattanDistance(current.state) === 0) {
      const endT = performance.now();
      return {
        path: current.path,
        nodesExplored,
        timeTaken: Math.round(endT - startT)
      };
    }

    const neighbors = getNeighbors(current.state);
    
    for (const neighbor of neighbors) {
      const neighborString = neighbor.join(',');
      if (!closedSet.has(neighborString)) {
        const g = current.g + 1;
        const h = getManhattanDistance(neighbor);
        const f = g + h;
        openList.push({
          state: neighbor,
          g,
          h,
          f,
          path: [...current.path, neighbor]
        });
      }
    }
  }

  const endT = performance.now();
  return { path: null, nodesExplored, timeTaken: Math.round(endT - startT) }; 
}

// -----------------------------------------
// GRID PATHFINDING UTILITIES (A*)
// -----------------------------------------

export function solvePathfindingAStar(grid, startNode, endNode) {
  const startT = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;
  
  let openList = [{
    row: startNode.row,
    col: startNode.col,
    g: 0,
    h: Math.abs(startNode.row - endNode.row) + Math.abs(startNode.col - endNode.col),
    f: Math.abs(startNode.row - endNode.row) + Math.abs(startNode.col - endNode.col),
    parent: null
  }];
  
  const closedSet = new Set();
  const enqueuedMap = new Map(); // Keep track of best g so far
  enqueuedMap.set(`${startNode.row},${startNode.col}`, 0);
  const visitedNodesInOrder = [];
  
  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    const key = `${current.row},${current.col}`;
    
    if (closedSet.has(key)) continue;
    
    // Track visited for animation
    visitedNodesInOrder.push({ row: current.row, col: current.col });
    closedSet.add(key);
    
    if (current.row === endNode.row && current.col === endNode.col) {
      // Reconstruct path
      const path = [];
      let curr = current;
      while (curr !== null) {
        path.unshift({ row: curr.row, col: curr.col });
        curr = curr.parent;
      }
      return {
        visitedNodes: visitedNodesInOrder,
        path,
        nodesExplored: closedSet.size,
        timeTaken: Math.round(performance.now() - startT)
      };
    }
    
    // Get neighbors (up, down, left, right)
    const moves = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of moves) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (!grid[nr][nc].isWall) {
          const g = current.g + 1;
          const h = Math.abs(nr - endNode.row) + Math.abs(nc - endNode.col); // Manhattan
          const neighborKey = `${nr},${nc}`;
          
          if (!closedSet.has(neighborKey)) {
            const bestG = enqueuedMap.get(neighborKey);
            if (bestG === undefined || g < bestG) {
              enqueuedMap.set(neighborKey, g);
              openList.push({ row: nr, col: nc, g, h, f: g + h, parent: current });
            }
          }
        }
      }
    }
  }
  
  return {
    visitedNodes: visitedNodesInOrder,
    path: [], // Empty path = not found
    nodesExplored: closedSet.size,
    timeTaken: Math.round(performance.now() - startT)
  };
}
