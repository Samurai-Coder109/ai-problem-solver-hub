export function solveBlockWorld(initial, goal) {
  // initial and goal are objects: { A: 'table', B: 'A', C: 'table' } ...
  // Find a sequence using BFS. State is represented as a stringified object.
  // We have blocks A, B, C, D, E depending on user input.
  const blocks = Object.keys(initial);
  
  function getClearBlocks(state) {
     const clear = new Set(blocks);
     for (let b of blocks) {
         if (state[b] !== 'table' && state[b]) { // someone is on something
            clear.delete(state[b]); // the base is not clear
         }
     }
     return Array.from(clear);
  }
  
  function isGoal(state) {
     for (let b of blocks) {
         if (state[b] !== goal[b]) return false;
     }
     return true;
  }
  
  function serialize(state) {
     return blocks.map(b => `${b}:${state[b]}`).join('|');
  }
  
  let q = [{ state: initial, path: [] }];
  let visited = new Set();
  visited.add(serialize(initial));
  
  while(q.length > 0) {
      const { state, path } = q.shift();
      
      if (isGoal(state)) {
         return path;
      }
      
      // Generate next states
      const clearBlocks = getClearBlocks(state);
      
      for (let blockMove of clearBlocks) {
          // move blockMove to table
          if (state[blockMove] !== 'table') {
              let newState = {...state};
              newState[blockMove] = 'table';
              let s = serialize(newState);
              if (!visited.has(s)) {
                  visited.add(s);
                  q.push({
                      state: newState,
                      path: [...path, {
                          action: `Move ${blockMove} to table`,
                          state: { on: newState }
                      }]
                  });
              }
          }
          
          // move blockMove onto another clear block
          for (let targetBlock of clearBlocks) {
              if (blockMove !== targetBlock) {
                  let newState = {...state};
                  newState[blockMove] = targetBlock;
                  let s = serialize(newState);
                  if (!visited.has(s)) {
                      visited.add(s);
                      q.push({
                          state: newState,
                          path: [...path, {
                              action: `Move ${blockMove} onto ${targetBlock}`,
                              state: { on: newState }
                          }]
                      });
                  }
              }
          }
      }
  }
  
  return []; // Impossible or error
}
