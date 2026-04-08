/**
 * src/algorithms/ucs.js
 * Implements Uniform Cost Search for Grid Pathfinding.
 * On an unweighted 4D grid, UCS expands spherically like BFS, prioritizing lowest cost path.
 */

export function solvePathfindingUCS(grid, startNode, endNode) {
  const startT = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Priority queue based on current path cost (g)
  let openList = [{
    row: startNode.row,
    col: startNode.col,
    g: 0,
    parent: null
  }];
  
  const closedSet = new Set();
  const enqueuedMap = new Map(); // Keep track of best g so far
  enqueuedMap.set(`${startNode.row},${startNode.col}`, 0);
  const visitedNodesInOrder = [];
  
  while (openList.length > 0) {
    // Sort by cost (g) - Uniform Cost Search
    openList.sort((a, b) => a.g - b.g);
    const current = openList.shift();
    const key = `${current.row},${current.col}`;
    
    // Skip if we already expanded a better path to this node
    if (closedSet.has(key)) continue;
    
    // Track visited nodes
    visitedNodesInOrder.push({ row: current.row, col: current.col });
    closedSet.add(key);
    
    // Found goal
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
    
    // Traverse standard 4-way grid neighbors
    const moves = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of moves) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      
      // Ensure in-bounds
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (!grid[nr][nc].isWall) {
          const g = current.g + 1; // Assuming cost to move is uniform (1)
          const neighborKey = `${nr},${nc}`;
          
          if (!closedSet.has(neighborKey)) {
            const bestG = enqueuedMap.get(neighborKey);
            if (bestG === undefined || g < bestG) {
              enqueuedMap.set(neighborKey, g);
              openList.push({ row: nr, col: nc, g, parent: current });
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
