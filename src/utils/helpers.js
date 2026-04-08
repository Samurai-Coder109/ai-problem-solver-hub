/**
 * Pauses execution for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deep clones a 2D array / matrix
 * @param {Array<Array<any>>} matrix 
 * @returns {Array<Array<any>>}
 */
export const cloneMatrix = (matrix) => matrix.map(row => [...row]);

/**
 * Generates an array of n numbers from 0 to n-1
 * @param {number} n 
 * @returns {Array<number>}
 */
export const range = (n) => Array.from({ length: n }, (_, i) => i);
