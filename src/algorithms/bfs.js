/**
 * src/algorithms/bfs.js
 * Implements Breadth First Search for Missionaries & Cannibals and Pathfinding Visualizer.
 */

// -----------------------------------------
// MISSIONARIES AND CANNIBALS
// -----------------------------------------

const GOAL_STATE = '0,0,0'; // m,c,b on left bank

function isValidState(m, c) {
  if (m < 0 || c < 0 || m > 3 || c > 3) return false;
  // If missionaries are present and outnumbered by cannibals on Left bank
  if (m > 0 && m < c) return false;
  
  const rightM = 3 - m;
  const rightC = 3 - c;
  // If missionaries are present and outnumbered by cannibals on Right bank
  if (rightM > 0 && rightM < rightC) return false;
  
  return true;
}

function getNextStates(m, c, b) {
  const nextStates = [];
  const moves = [
    { dm: 1, dc: 0 },
    { dm: 2, dc: 0 },
    { dm: 0, dc: 1 },
    { dm: 0, dc: 2 },
    { dm: 1, dc: 1 }
  ];

  for (const move of moves) {
    if (b === 1) { // Boat on left, subtracting from left
      const newM = m - move.dm;
      const newC = c - move.dc;
      if (isValidState(newM, newC)) {
        nextStates.push({ m: newM, c: newC, b: 0 });
      }
    } else { // Boat on right, adding to left
      const newM = m + move.dm;
      const newC = c + move.dc;
      if (isValidState(newM, newC)) {
        nextStates.push({ m: newM, c: newC, b: 1 });
      }
    }
  }
  return nextStates;
}

/**
 * Solves the Missionaries & Cannibals problem using BFS.
 * @returns {Object} result 
 */
export function solveMissionariesBFS() {
  const startT = performance.now();
  
  const initialState = { m: 3, c: 3, b: 1 };
  const initialString = '3,3,1';
  
  const queue = [{
    state: initialState,
    path: [initialState]
  }];
  
  let nodesExplored = 0;
  const closedSet = new Set();
  
  while (queue.length > 0) {
    const current = queue.shift();
    const currentString = `${current.state.m},${current.state.c},${current.state.b}`;
    
    if (closedSet.has(currentString)) continue;
    
    closedSet.add(currentString);
    nodesExplored++;
    
    if (currentString === GOAL_STATE) {
      const endT = performance.now();
      return { path: current.path, nodesExplored, timeTaken: Math.round(endT - startT) };
    }
    
    const neighbors = getNextStates(current.state.m, current.state.c, current.state.b);
    
    for (const neighbor of neighbors) {
      const neighborString = `${neighbor.m},${neighbor.c},${neighbor.b}`;
      if (!closedSet.has(neighborString)) {
        queue.push({
          state: neighbor,
          path: [...current.path, neighbor]
        });
      }
    }
  }
  
  const endT = performance.now();
  return { path: null, nodesExplored, timeTaken: Math.round(endT - startT) };
}

// -----------------------------------------
// GRID PATHFINDING UTILITIES (BFS)
// -----------------------------------------

export function solvePathfindingBFS(grid, startNode, endNode) {
  const startT = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;
  
  let queue = [{
    row: startNode.row,
    col: startNode.col,
    parent: null
  }];
  
  const closedSet = new Set();
  const queuedSet = new Set([`${startNode.row},${startNode.col}`]);
  const visitedNodesInOrder = [];
  
  while (queue.length > 0) {
    const current = queue.shift(); // BFS uses shift (FIFO queue)
    const key = `${current.row},${current.col}`;
    
    if (closedSet.has(key)) continue;
    
    visitedNodesInOrder.push({ row: current.row, col: current.col });
    closedSet.add(key);
    
    if (current.row === endNode.row && current.col === endNode.col) {
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
    
    const moves = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of moves) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighborKey = `${nr},${nc}`;
        if (!grid[nr][nc].isWall && !closedSet.has(neighborKey) && !queuedSet.has(neighborKey)) {
          queuedSet.add(neighborKey);
          queue.push({ row: nr, col: nc, parent: current });
        }
      }
    }
  }
  
  return {
    visitedNodes: visitedNodesInOrder,
    path: [],
    nodesExplored: closedSet.size,
    timeTaken: Math.round(performance.now() - startT)
  };
}
