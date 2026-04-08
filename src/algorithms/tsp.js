/**
 * src/algorithms/tsp.js
 * Implements Nearest Neighbor heuristic for the Travelling Salesman Problem.
 */

/**
 * Calculates Euclidean distance between two points.
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @returns {number}
 */
export function getEuclideanDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Solves the TSP using the Nearest Neighbor heuristic.
 * 
 * @param {Array<Object>} cities - Array of objects with { id, x, y }
 * @returns {Object} result - Contains path (array of cities in order), totalDistance, nodesExplored, and timeTaken
 */
export function solveTSPNearestNeighbor(cities) {
  const startT = performance.now();
  
  if (!cities || cities.length === 0) {
    return { path: [], totalDistance: 0, nodesExplored: 0, timeTaken: 0 };
  }

  // Start at the first city in the list
  const unvisited = [...cities];
  const currentCity = unvisited.shift(); // Remove first city
  
  const path = [currentCity];
  let totalDistance = 0;
  let nodesExplored = 1;

  while (unvisited.length > 0) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    // Find the nearest unvisited city
    for (let i = 0; i < unvisited.length; i++) {
        nodesExplored++;
        const p1 = path[path.length - 1]; // Current city
        const p2 = unvisited[i];
        const distance = getEuclideanDistance(p1, p2);

        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
        }
    }

    // Move to the nearest city
    totalDistance += minDistance;
    path.push(unvisited[nearestIndex]);
    unvisited.splice(nearestIndex, 1);
  }

  // Return to start city to complete the cycle
  const lastCity = path[path.length - 1];
  const firstCity = path[0];
  totalDistance += getEuclideanDistance(lastCity, firstCity);
  path.push(firstCity);

  const endT = performance.now();

  return {
    path,
    totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimals
    nodesExplored,
    timeTaken: Math.round(endT - startT)
  };
}
