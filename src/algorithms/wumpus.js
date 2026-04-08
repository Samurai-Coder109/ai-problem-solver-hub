export function getAdjacents(r, c, size = 4) {
    const adjs = [];
    if (r > 0) adjs.push([r-1, c]);
    if (r < size-1) adjs.push([r+1, c]);
    if (c > 0) adjs.push([r, c-1]);
    if (c < size-1) adjs.push([r, c+1]);
    return adjs;
}

export function generateValidWumpusWorld(size = 4) {
    while (true) {
        let grid = Array.from({length: size}, () => Array.from({length: size}, () => ({wumpus: false, pit: false, gold: false})));
        let allCells = [];
        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                allCells.push([r,c]);
            }
        }
        
        let goldCandidates = allCells.filter(([r,c]) => (r + c) >= 4);
        let goldPos = goldCandidates[Math.floor(Math.random() * goldCandidates.length)];
        grid[goldPos[0]][goldPos[1]].gold = true;
        
        let wumpCandidates = allCells.filter(([r,c]) => {
            if (r===0 && c===0) return false;
            if (r===goldPos[0] && c===goldPos[1]) return false;
            return (r + c) >= 2;
        });
        wumpCandidates.sort(() => Math.random() - 0.5);
        let wumpusPos = wumpCandidates.find(([r,c]) => (r===1||r===2) && (c===1||c===2)) || wumpCandidates[0];
        grid[wumpusPos[0]][wumpusPos[1]].wumpus = true;
        
        let pitCandidates = allCells.filter(([r,c]) => {
            if (r===0 && c===0) return false;
            if (r===goldPos[0] && c===goldPos[1]) return false;
            if (r===wumpusPos[0] && c===wumpusPos[1]) return false;
            return (r + c) >= 1;
        });
        pitCandidates.sort(() => Math.random() - 0.5);
        
        let numPits = 2 + Math.floor(Math.random() * 2); 
        for(let i=0; i<numPits && i<pitCandidates.length; i++) {
            let p = pitCandidates[i];
            grid[p[0]][p[1]].pit = true;
        }

        let safeSet = new Set();
        for(let r=0; r<size; r++) {
            for(let c=0; c<size; c++) {
                if (!grid[r][c].pit && !grid[r][c].wumpus) safeSet.add(`${r},${c}`);
            }
        }
        let tStr = `${goldPos[0]},${goldPos[1]}`;
        let reachable = false;
        let q = [{pos: [0,0]}];
        let v = new Set(["0,0"]);
        while(q.length > 0) {
            let curr = q.shift();
            let cstr = `${curr.pos[0]},${curr.pos[1]}`;
            if (cstr === tStr) { reachable = true; break; }
            let adjs = getAdjacents(curr.pos[0], curr.pos[1], size);
            for (let a of adjs) {
                let astr = `${a[0]},${a[1]}`;
                if (!v.has(astr) && safeSet.has(astr)) { v.add(astr); q.push({pos: a}); }
            }
        }
        
        if (!reachable) continue;
        
        let steps = solveWumpus(grid, size);
        if (steps.length > 0 && steps[steps.length-1].success) {
            let tookRisk = steps.some(s => s.desc.includes('Taking calculated risk'));
            let encounteredDanger = steps.some(s => s.percepts.includes("P") || s.percepts.includes("W"));
            if (!tookRisk && encounteredDanger) return grid;
        }
    }
}

export function solveWumpus(grid, size = 4) {
    let pos = [0,0];
    let visited = new Set(["0,0"]);
    let safe = new Set(["0,0"]);
    let confirmedDanger = new Set();
    
    let steps = [];
    let pitConstraints = [];
    let wumpusConstraints = [];
    
    const maxSteps = 100;
    
    for (let stepIndex = 0; stepIndex < maxSteps; stepIndex++) {
        let [r, c] = pos;
        let p = "";
        let adjs = getAdjacents(r, c, size);
        for(let [ar, ac] of adjs) {
            if (grid[ar][ac].pit && !p.includes("P")) p += "P";
            if (grid[ar][ac].wumpus && !p.includes("W")) p += "W";
        }
        if (grid[r][c].gold) p += "G";
        
        let desc = "";
        let unknownAdjs = adjs.filter(([ar, ac]) => !safe.has(`${ar},${ac}`) && !confirmedDanger.has(`${ar},${ac}`));
        
        if (p.includes("P") || p.includes("W")) {
             if (p.includes("P") && p.includes("W")) desc += "Breeze and Stench detected \u2192 marking neighbors as possible danger. ";
             else if (p.includes("P")) desc += "Breeze detected \u2192 marking neighbors as possible pits. ";
             else if (p.includes("W")) desc += "Stench detected \u2192 marking neighbors as possible Wumpus. ";
             
             if (p.includes("P") && unknownAdjs.length > 0) pitConstraints.push({origin: `${r},${c}`, cells: unknownAdjs.map(a=>`${a[0]},${a[1]}`)});
             if (p.includes("W") && unknownAdjs.length > 0) wumpusConstraints.push({origin: `${r},${c}`, cells: unknownAdjs.map(a=>`${a[0]},${a[1]}`)});
        } else {
             desc += "Clear cell \u2192 marking neighbors as SAFE. ";
             unknownAdjs.forEach(([ar,ac]) => safe.add(`${ar},${ac}`));
        }
        
        let madeDeduction = true;
        while(madeDeduction) {
            madeDeduction = false;
            for (let cons of [...pitConstraints, ...wumpusConstraints]) {
                cons.cells = cons.cells.filter(c => !safe.has(c));
                if (cons.cells.length === 1 && !confirmedDanger.has(cons.cells[0])) {
                    confirmedDanger.add(cons.cells[0]);
                    madeDeduction = true;
                }
            }
            
            let allConstrainedCells = new Set();
            for (let cons of [...pitConstraints, ...wumpusConstraints]) {
                 for (let c of cons.cells) if (!confirmedDanger.has(c)) allConstrainedCells.add(c);
            }
            
            for (let v of visited) {
                let [vr, vc] = v.split(',').map(Number);
                let vAdjs = getAdjacents(vr, vc, size);
                for (let [ar, ac] of vAdjs) {
                    let cStr = `${ar},${ac}`;
                    if (!safe.has(cStr) && !confirmedDanger.has(cStr) && !allConstrainedCells.has(cStr)) {
                        safe.add(cStr);
                        madeDeduction = true;
                    }
                }
            }
        }
        
        let possibleDangerSet = new Set();
        for (let cons of [...pitConstraints, ...wumpusConstraints]) {
             for (let c of cons.cells) if (!safe.has(c) && !confirmedDanger.has(c)) possibleDangerSet.add(c);
        }
        
        let currentStateDump = {
            agentPos: [r,c], desc: desc, percepts: p, 
            knownSafe: Array.from(safe), possibleDanger: Array.from(possibleDangerSet), dangerous: Array.from(confirmedDanger)
        };
        
        if (p.includes("G")) {
            currentStateDump.desc = "Gold found! Mission successful.";
            currentStateDump.success = true;
            steps.push(currentStateDump);
            break;
        }
        steps.push(currentStateDump);
        
        let unvisitedSafe = Array.from(safe).filter(x => !visited.has(x));
        if (unvisitedSafe.length > 0) {
            let target = findClosest(pos, unvisitedSafe, safe, size);
            if (target) {
                let path = getBfsPath(pos, target, safe, size); 
                for (let i = 0; i < path.length; i++) {
                     pos = path[i];
                     visited.add(`${pos[0]},${pos[1]}`);
                     if (i < path.length - 1) { 
                         steps.push({
                            agentPos: [...pos], desc: `Backtracking to safe region [${pos[0]},${pos[1]}]`, percepts: "", 
                            knownSafe: Array.from(safe), possibleDanger: Array.from(possibleDangerSet), dangerous: Array.from(confirmedDanger)
                         });
                     }
                }
            } else {
                 steps.push({ agentPos: [...pos], desc: `Agent failed. No reachable paths.`, percepts: p, failed: true });
                 break;
            }
        } else {
            let riskMap = [];
            for (let cell of possibleDangerSet) {
                let count = pitConstraints.filter(c => c.cells.includes(cell)).length + wumpusConstraints.filter(c => c.cells.includes(cell)).length;
                riskMap.push({cell, risk: count});
            }
            riskMap.sort((a,b) => a.risk - b.risk);
            
            if (riskMap.length > 0) {
                let leastRisky = riskMap[0];
                let target = leastRisky.cell.split(',').map(Number);
                let path = getBfsPathAvoidingDanger(pos, target, safe, confirmedDanger, size);
                
                if (path) {
                    for (let i = 0; i < path.length - 1; i++) {
                       pos = path[i];
                       visited.add(`${pos[0]},${pos[1]}`);
                       steps.push({
                          agentPos: [...pos], desc: `Navigating towards boundary [${pos[0]},${pos[1]}]`, percepts: "", 
                          knownSafe: Array.from(safe), possibleDanger: Array.from(possibleDangerSet), dangerous: Array.from(confirmedDanger)
                       });
                    }
                    pos = target;
                    visited.add(`${target[0]},${target[1]}`);
                     
                     if (grid[target[0]][target[1]].pit || grid[target[0]][target[1]].wumpus) {
                         steps.push({ agentPos: [...pos], desc: `Taking calculated risk \u2192 Hazard triggered! Agent failed.`, percepts: "", failed: true });
                         break;
                     } else {
                         safe.add(`${target[0]},${target[1]}`);
                         steps.push({ agentPos: [...pos], desc: `Taking calculated risk \u2192 Cell is safe!`, percepts: "", knownSafe: Array.from(safe), possibleDanger: Array.from(possibleDangerSet), dangerous: Array.from(confirmedDanger) });
                     }
                } else {
                    steps.push({ agentPos: [...pos], desc: `Agent failed. Stuck!`, failed: true });
                    break;
                }
            } else {
                steps.push({ agentPos: [...pos], desc: `Agent failed. No reachable path bounds remaining.`, failed: true });
                break;
            }
        }
    }
    return steps;
}

function findClosest(start, targets, safeSet, size) {
     let q = [{pos: start, dist: 0}];
     let v = new Set([`${start[0]},${start[1]}`]);
     let targetSet = new Set(targets);
     while(q.length > 0) {
         let curr = q.shift();
         let cstr = `${curr.pos[0]},${curr.pos[1]}`;
         if (targetSet.has(cstr)) return curr.pos;
         let adjs = getAdjacents(curr.pos[0], curr.pos[1], size);
         for (let a of adjs) {
             let astr = `${a[0]},${a[1]}`;
             if (!v.has(astr) && safeSet.has(astr)) { v.add(astr); q.push({pos: a, dist: curr.dist+1}); }
         }
     }
     return null;
}

function getBfsPath(start, target, safeSet, size) {
     let q = [{pos: start, path: []}];
     let v = new Set([`${start[0]},${start[1]}`]);
     let tStr = `${target[0]},${target[1]}`;
     while(q.length > 0) {
         let curr = q.shift();
         let cstr = `${curr.pos[0]},${curr.pos[1]}`;
         if (cstr === tStr) return curr.path;
         let adjs = getAdjacents(curr.pos[0], curr.pos[1], size);
         for (let a of adjs) {
             let astr = `${a[0]},${a[1]}`;
             if (!v.has(astr) && (safeSet.has(astr) || astr === tStr)) { v.add(astr); q.push({pos: a, path: [...curr.path, a]}); }
         }
     }
     return null;
}

function getBfsPathAvoidingDanger(start, target, safeSet, confirmedDanger, size) {
     let q = [{pos: start, path: []}];
     let v = new Set([`${start[0]},${start[1]}`]);
     let tStr = `${target[0]},${target[1]}`;
     while(q.length > 0) {
         let curr = q.shift();
         let cstr = `${curr.pos[0]},${curr.pos[1]}`;
         if (cstr === tStr) return curr.path;
         let adjs = getAdjacents(curr.pos[0], curr.pos[1], size);
         for (let a of adjs) {
             let astr = `${a[0]},${a[1]}`;
             if (!v.has(astr) && !confirmedDanger.has(astr)) { v.add(astr); q.push({pos: a, path: [...curr.path, a]}); }
         }
     }
     return null;
}
