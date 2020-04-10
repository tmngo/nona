import registerPromiseWorker from 'promise-worker/register'

let generatorMap = {
  "uniform": generateUniform,
  "metaball": generateMetaball,
}

registerPromiseWorker((message) => {

  switch (message.command) {
    case "generate":
      return generatePuzzle(message);
    case "solve":
      return solvePuzzle(message);
    case "solve-iteration":
      return solveIterationPuzzle(message)
  }

})

function generatePuzzle(message) {
  let size = message.size;
  let density = message.density;
  let removal = message.removal;
  let type = message.type;
  let options = message.options;

  let grid = generateRandomSolvablePuzzle(size, density, type, options)

  let n = grid.length;
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(i)
  }
  let lines = {
    l: arr.map(z => arr.map(y => arr.map(x => grid[x][y][z]))),
    r: arr.map(z => arr.map(x => arr.map(y => grid[x][y][z]))),
    t: arr.map(y => arr.map(x => grid[x][y])),
  };
  let clueGrids = {
    l: lines.l.map(row => row.map(line => createClueFromLine(line))),
    r: lines.r.map(row => row.map(line => createClueFromLine(line))),
    t: lines.t.map(row => row.map(line => createClueFromLine(line))),
  }
  let clues = clueGrids.l.concat(clueGrids.r, clueGrids.t).flat();

  clueGrids = removeClues(removal, clueGrids, grid, clues)

  return {
    grid: grid,
    clueGrids: clueGrids,
  }
}

function solvePuzzle(message) {
  let grid = message.grid;
  let clueGrids = message.clueGrids;
  solve(grid, clueGrids);
  return {
    grid: grid,
    clueGrids: clueGrids,
  }
}

function solveIterationPuzzle(message) {
  let grid = message.grid;
  let clueGrids = message.clueGrids;
  solveFaces(grid, clueGrids);
  return {
    grid: grid,
    clueGrids: clueGrids,
  }
}

/* Clears painted and broken cubes. */
function resetPuzzle(grid, clues) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      for (let k = 0; k < grid.length; k++) {
        grid[i][j][k].painted = false;
        grid[i][j][k].broken = false;
      }
    }
  }
  for (let i = 0; i < clues.length; i++) {
    clues[i].isSolved = false;
  }
}

/* Generates puzzles until a line-solvable puzzle is created. */
function generateRandomSolvablePuzzle(size, density, type, options) {
  let generator = generatorMap[type]
  let iterations = 1;
  let grid;
  let solved = false;
  while (iterations++ < 15 && !solved) {
    grid = generator(size, density, options)
    solved = solve(grid);
  }
  console.log('unsolved: ' + (iterations - 1) + ' solved: ' + (solved ? 1 : 0));
  return grid;
}

/* Generates a puzzle based on density. */
function generateUniform(size, density) {
  let puzzle = [];
  for (let i = 0; i < size; i++) {
    puzzle[i] = [];
    for (let j = 0; j < size; j++) {
      puzzle[i][j] = [];
      for (let k = 0; k < size; k++) {
        puzzle[i][j][k] = {
          id: i + "," + j + "," + k,
          i: i,
          j: j,
          k: k,
          solid: Math.random() < density,
          painted: false,
          broken: false,
          selected: false,
          strike: false,
        }
      }
    }
  }
  return puzzle;
}

function generateMetaball(size, density = 0.5, options) {
  let balls = options.metaballs;
  let noise = options.noise;
  let threshold = 0.8 / (density * (noise + 1) / 2) / Math.pow(size, 2) * (Math.log10(balls + 9));
  let points = []
  for (let i = 0; i < balls; i++) {
    let x = getRandomInt(0, size);
    let y = getRandomInt(0, size);
    let z = getRandomInt(0, size);
    let power = 0.5 + Math.random();
    points.push([x, y, z, power])
  }
  // console.log(points)
  let puzzle = [];
  for (let i = 0; i < size; i++) {
    puzzle[i] = [];
    for (let j = 0; j < size; j++) {
      puzzle[i][j] = [];
      for (let k = 0; k < size; k++) {
        puzzle[i][j][k] = {
          id: i + "," + j + "," + k,
          i: i,
          j: j,
          k: k,
          solid: fastReduce(points, (sum, point) => sum + point[3] * (1 - noise * Math.random()) / computeDistanceSquared(point, [i, j, k]), 0) > threshold * balls,
          painted: false,
          broken: false,
          selected: false,
          strike: false,
        }
      }
    }
  }
  return puzzle;
}

/* Removes clues that aren't needed to solve the puzzle. */
function removeClues(frac = 1, clueGrids, grid, clues) {
  let n = grid.length;
  let numClues = Math.min(Math.round(frac * 3 * n * n), 3 * n * n)
  let arr = shuffledNumbers(numClues)
  let removed = 0;
  for (let i = 0; i < numClues; i++) {
    removed += removeClue(arr[i], clueGrids, grid, clues)
  }
  console.log(`removed: ${removed}`)
  return clueGrids;

}

function removeClue(i, clueGrids, grid, clues) {
  let n = grid.length;
  let f = i % 3;
  let p = parseInt(i / 3 / n);
  let q = parseInt(i / 3) % n;
  clueGrids['lrt'[f]][p][q].isVisible = false;
  resetPuzzle(grid, clues);
  let solvable = solve(grid, clueGrids)
  if (!solvable) {
    clueGrids['lrt'[f]][p][q].isVisible = true;
  }
  return !clueGrids['lrt'[f]][p][q].isVisible
}

function createClueFromLine(line) {
  let count = 0;
  let groups = 0;
  let inside = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i].solid) {
      if (!inside) {
        groups++;
      }
      ++count;
      inside = true;
    } else {
      inside = false;
    }
  }
  return {
    isSolved: false,
    isVisible: true,
    count: count,
    groups: groups
  }
}

function calculatePrimes(iterations, multiplier) {
  var primes = [];
  for (var i = 0; i < iterations; i++) {
    var candidate = i * (multiplier * Math.random());
    var isPrime = true;
    for (var c = 2; c <= Math.sqrt(candidate); ++c) {
      if (candidate % c === 0) {
        // not prime
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(candidate);
    }
  }
  return primes;
}

function solve(grid, clueGrids) {
  
  solveTrivial(grid, clueGrids);
  
  let cubeArr = grid.flat(2);
  let currentBroken;
  let currentPainted;
  let newBroken = fastReduce(cubeArr, (count, cube) => (count + cube.broken), 0);
  let newPainted = fastReduce(cubeArr, (count, cube) => (count + cube.painted), 0);
  do {
    currentBroken = newBroken;
    currentPainted = newPainted;
    solveFaces(grid, clueGrids);
    newBroken = fastReduce(cubeArr, (count, cube) => (count + cube.broken), 0);
    newPainted = fastReduce(cubeArr, (count, cube) => (count + cube.painted), 0);
  } while ((currentBroken !== newBroken) && (currentPainted !== newPainted))

  solveFaces(grid, clueGrids);  
  solveFaces(grid, clueGrids);  
  solveFaces(grid, clueGrids);  

  let numSolid = fastReduce(cubeArr, (count, cube) => (count + cube.solid), 0);
  let n = grid.length;
  return newBroken === (n ** 3 - numSolid) && (newPainted === numSolid);
}

function reducerPainted(accumulator, cube) {
  return (accumulator << 1) + cube.painted
}

function reducerUnbroken(accumulator, cube) {
  return (accumulator << 1) + !cube.broken
}

/* Solves each face once. */
function solveTrivial(grid, clueGrids) {
  let n = grid.length;

  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(i)
  }


  let lines = {
    l: arr.map(z => arr.map(y => arr.map(x => grid[x][y][z]))),
    r: arr.map(z => arr.map(x => arr.map(y => grid[x][y][z]))),
    t: arr.map(y => arr.map(x => grid[x][y])),
  };

  if (clueGrids === undefined) {
    clueGrids = {
      l: lines.l.map(row => row.map(line => createClueFromLine(line))),
      r: lines.r.map(row => row.map(line => createClueFromLine(line))),
      t: lines.t.map(row => row.map(line => createClueFromLine(line))),
    }
  }

  let cubelines = lines.l.concat(lines.r, lines.t).flat();
  let clues = clueGrids.l.concat(clueGrids.r, clueGrids.t).flat();
  let painted = cubelines.map(line => fastReduce(line, reducerPainted, 0))
  let unbroken = cubelines.map(line => fastReduce(line, reducerUnbroken, 0))
  for (let i = 0; i < 3 * n * n; i++) {
    solveTrivialLine(n, painted[i], unbroken[i], clues[i], cubelines[i])
  }
}

function solveTrivialLine(n, painted, unbroken, clue, cubes) {
  if (clue.isVisible) {
    let solution = solveLineTrivial(painted, unbroken, clue.count);
    // console.log(solution)
    modifyLine(cubes, solution);
    // console.log(painted)
    if (painted === unbroken) {
      clue.isSolved = true;
    }
  }
}

/* Solves each face once. */
function solveFaces(grid, clueGrids) {
  let n = grid.length;

  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(i)
  }

  let lines = {
    l: arr.map(z => arr.map(y => arr.map(x => grid[x][y][z]))),
    r: arr.map(z => arr.map(x => arr.map(y => grid[x][y][z]))),
    t: arr.map(y => arr.map(x => grid[x][y])),
  };

  if (clueGrids === undefined) {
    clueGrids = {
      l: lines.l.map(row => row.map(line => createClueFromLine(line))),
      r: lines.r.map(row => row.map(line => createClueFromLine(line))),
      t: lines.t.map(row => row.map(line => createClueFromLine(line))),
    }
  }

  let cubelines = lines.l.concat(lines.r, lines.t).flat();
  let clues = clueGrids.l.concat(clueGrids.r, clueGrids.t).flat();
  let painted = cubelines.map(line => fastReduce(line, reducerPainted, 0))
  let unbroken = cubelines.map(line => fastReduce(line, reducerUnbroken, 0))

  for (let i = 0; i < 3 * n * n; i++) {
    solveSingleLine(n, painted[i], unbroken[i], clues[i], cubelines[i])
  }
}

function solveSingleLine(n, painted, unbroken, clue, cubes) {
  if ((!clue.isSolved) && (clue.isVisible)) {
    let solution = solveLine(painted, unbroken, n, clue.count, clue.groups);
    modifyLine(cubes, solution);
    if (painted === unbroken) {
      clue.isSolved = true;
    }
  }
}

/* Builds the rightmost (least-significant) solution of a line, without 
     * accounting for known (painted) solids. */
function placeRightSimple(blockSizes, unbrokenBits) {
  let blockBits = 0;
  let blocks = [];
  for (let i = 0; i < blockSizes.length; i++) {
    let block = ones(blockSizes[i]);
    while (((block | unbrokenBits)) != unbrokenBits
      || ((((block >> 1) | block) & blockBits) != 0)
      || block <= blockBits) {
      block <<= 1;
      if (block > unbrokenBits) return [];
    }
    blockBits |= block;
    blocks.push(block)
  }
  return blocks;
}

/* Builds the rightmost (least-significant) solution of a line, accounting 
 * for known (painted) solids. 
 * 
 * blocks:        [1, 2, 1, 3, ...]
 * unbrokenBits:  1111101111
 * paintedBits:   0000100000
 * */
function placeRightComplex(blockSizes, unbrokenBits, paintedBits) {

  // initial simple placement
  let blocks = placeRightSimple(blockSizes, unbrokenBits);
  let i = blocks.length;

  // if simple placement fails, return
  if (i === 0) return [];

  let blockBits = mergeBlocks(blocks);
  let paintBlocks = makeSingles(paintedBits); // L -> R
  let leftmostSolid;
  let leftmostBlock;
  let x;

  // while there are unassigned solids
  while ((blockBits & paintedBits) !== paintedBits) {

    if (i === 0) return [];

    // get the leftmost unassigned solid
    x = paintBlocks.length - 1;
    leftmostSolid = paintBlocks[x];
    while ((leftmostSolid & blockBits)) {
      if (x === 0) return [];
      leftmostSolid = paintBlocks[--x]
    }

    // get the block to the right of the unassigned solid
    leftmostBlock = blocks[--i];
    for (i; i >= 0; i--) {
      if (blocks[i] < leftmostSolid) {
        leftmostBlock = blocks[i];
        break;
      }
    }
    if (leftmostBlock > leftmostSolid) return [];

    // move the block until its left edge overlaps the unassigned solid
    while ((leftmostBlock & leftmostSolid) === 0) {
      leftmostBlock <<= 1;
    }

    // while the block overlaps the unassigned solid 
    while (leftmostBlock & leftmostSolid) {

      // split blocks
      let leftBlocks = blocks.slice(i + 1);
      let leftBlockBits = mergeBlocks(leftBlocks);
      let rightBlockBits = mergeBlocks(blocks.slice(0, i));

      // if this is a valid position (on unbroken blocks)
      if (((leftmostBlock & unbrokenBits) === leftmostBlock)) {

        // if left blocks overlap and need to be repositioned
        if ((leftmostBlock | (leftmostBlock << 1)) & leftBlockBits) {
          // reposition all blocks to the left of this block
          let freeBits = ~ones(leftmostBlock.toString(2).length + 1) & unbrokenBits;
          let leftBlockSizes = leftBlocks.map(x => countOnes(x));
          let movedLeftBlocks = placeRightSimple(leftBlockSizes, freeBits);
          if (leftBlocks.length && !movedLeftBlocks.length) {
            return [];
          }
          leftBlockBits = mergeBlocks(movedLeftBlocks);
        }

        // re-merge changed blocks
        blockBits = leftBlockBits | leftmostBlock | rightBlockBits;
        blocks = makeBlocks(blockBits);
        i = blocks.length;
        // move on to next unassigned solid
        break;
      }
      else {
        leftmostBlock <<= 1;
      }
    }
  }
  return blocks;
}

/* Builds the rightmost (least-significant) solution of a line, accounting 
 * for known (painted) solids. */
function placeRight(blockSizes, unbrokenBits, paintedBits) {
  return (paintedBits) ? placeRightComplex(blockSizes, unbrokenBits, paintedBits)
    : placeRightSimple(blockSizes, unbrokenBits);
}

/* Builds the leftmost (most-significant) solution of a line, accounting 
 * for known (painted) solids. */
function placeLeft(blockSizes, unbrokenBits, paintedBits, lineWidth) {
  unbrokenBits = reverseNBits(unbrokenBits, lineWidth);
  paintedBits = reverseNBits(paintedBits, lineWidth);
  return placeRightComplex(blockSizes.reverse(), unbrokenBits, paintedBits)
    .map(x => reverseNBits(x, lineWidth)).reverse();
}

/* Solves line and returns bits corresponding to cubes deduced to be solid 
 * and cubes deduced to be empty. */
function solveLine(paintedBits, unbrokenBits, lineWidth, clueCount, clueGroups) {
  let lineOnes = ones(lineWidth);
  let lineToPaint = 0;
  let lineToBreak = 0;

  // Empty line
  if (unbrokenBits === 0) {
    return {
      paint: lineToPaint,
      break: lineToBreak
    };
  }
  // Complete paint
  if (clueCount === countOnes(unbrokenBits)) {
    lineToPaint = unbrokenBits;
  }
  // Complete break
  else if (clueCount === countOnes(paintedBits)) {
    lineToBreak = unbrokenBits && ~paintedBits;
  }
  // Single left-right solve (totally unbroken, unpainted)
  else if (clueGroups === 1 && paintedBits === 0 && unbrokenBits === lineOnes) {
    let rightBlock = ones(clueCount);
    let leftBlock = rightBlock << (lineWidth - clueCount);
    lineToPaint = leftBlock & rightBlock;
  }
  // Single left-right solve (general)
  else if (clueGroups === 1) {
    let rightBlock = ones(clueCount);
    let leftBlock = rightBlock << (lineWidth - clueCount);
    // while R doesn't cover paintedBits OR R is not within unbrokenBits
    while (((rightBlock & paintedBits) != paintedBits) || ((rightBlock | unbrokenBits)) != unbrokenBits) {
      rightBlock <<= 1;
    }
    while (((leftBlock & paintedBits) != paintedBits) || ((leftBlock | unbrokenBits)) != unbrokenBits) {
      leftBlock >>>= 1;
    }

    lineToPaint = paintedBits ^ (leftBlock & rightBlock);
    if (leftBlock & rightBlock) {
      lineToBreak = lineOnes ^ (leftBlock | rightBlock);
    } else {
      let unbrokenBlocks = makeBlocks(unbrokenBits);
      for (let i = 0; i < unbrokenBlocks.length; i++) {
        if (countOnes(unbrokenBlocks[i]) < clueCount) {
          lineToBreak |= unbrokenBlocks[i]
        }
      }
    }
  }
  // Double (totally unbroken, width-1)
  else if (clueGroups == 2 && unbrokenBits == lineOnes && (clueCount === lineWidth - 1)) {
    lineToPaint = (1 << (lineWidth - 1)) + 1;
  }
  // Double (contiguous unbroken, width-1)
  else if (clueGroups == 2
    && (countOnes(unbrokenBits) == countMaxConsecutiveOnes(unbrokenBits))
    && (clueCount === countOnes(unbrokenBits) - 1)) {
    lineToPaint = (1 << (countOnes(unbrokenBits) - 1)) + 1;
    while ((lineToPaint & unbrokenBits) != lineToPaint) {
      lineToPaint <<= 1;
    }
  }
  // Double / triple (general)
  else if (clueGroups > 1) {
    // console.log('[' + lineWidth + ', ' + clueCount + ', ' + clueGroups + ', 0b' 
    //     + unbrokenBits.toString(2) + ', 0b' + paintedBits.toString(2) + ', 0b0, 0b0]')

    let permutations = findValidCompositions(clueCount, clueGroups, lineWidth);
    let possibleSolids = [];
    let possibleEmptys = [];
    for (let i = 0; i < permutations.length; i++) {
      let blockSizes = permutations[i];
      // console.log(blockSizes);
      let right = placeRight(blockSizes, unbrokenBits, paintedBits);
      // console.log("r " + right.map(x => x.toString(2)))
      let left = placeLeft(blockSizes, unbrokenBits, paintedBits, lineWidth);
      // console.log("l " + left.map(x => x.toString(2)))

      // Skip permutation if it cannot be placed
      if (right.length === 0 || left.length === 0) {
        continue;
      }
      // console.log("R " + mergeBlocks(right).toString(2))
      // console.log("L " + mergeBlocks(left).toString(2))

      // Determine solid cubes based on left-right overlap of each block
      let solid = 0;
      for (let j = 0; j < right.length; j++) {
        solid |= (right[j] & left[j]);
      }
      possibleSolids.push(solid);

      // Determine empty cubes based on left-right range of each block
      let empty = 0;
      for (let a = 0; a < lineWidth; a++) {
        let cell = (1 << a);
        for (let b = 0; b < right.length; b++) {
          if (((cell <= left[b]) && (cell >= right[b])) || ((cell & right[b]) !== 0)) {
            cell = 0;
            break;
          }
        }
        empty |= cell;
      }

      // Determine empty cubes based on adjacency to complete blocks
      let paintBlocks = makeBlocks(paintedBits);
      if (((countOnes(paintedBits) === clueCount - 1)
        && ((clueGroups === 2 && paintBlocks.length === 1)
          || (clueGroups > 2 && paintBlocks.length === 2)))
        || (clueGroups > 2 && countMaxConsecutiveOnes(paintedBits) === clueCount - 2)) {
        let adjacent = (paintedBits << 1 | paintedBits >> 1) & ~paintedBits;
        adjacent = adjacent & lineOnes;
        empty |= adjacent;
        empty = (empty & ~solid) & lineOnes;
      }
      possibleEmptys.push(empty);

      // console.log("solid: " + solid.toString(2))
      // console.log("empty: " + empty.toString(2))
    }
    // Merge all potential solutions
    lineToPaint = (possibleSolids.length) ? fastReduce(possibleSolids, (bits, p) => (bits & p)) : 0;
    lineToBreak = (possibleEmptys.length) ? fastReduce(possibleEmptys, (bits, b) => (bits & b)) : 0;
  }
  return {
    paint: lineToPaint & ~paintedBits,  // prevent repainting
    break: lineToBreak & unbrokenBits   // prevent rebreaking
  };
}

function solveLineTrivial(paintedBits, unbrokenBits, clueCount) {
  let lineToPaint = 0;
  let lineToBreak = 0;
  // Complete paint
  if (clueCount === countOnes(unbrokenBits)) {
    lineToPaint = unbrokenBits;
  }
  // Complete break
  else if (clueCount === countOnes(paintedBits)) {
    lineToBreak = unbrokenBits && ~paintedBits;
  }
  return {
    paint: lineToPaint & ~paintedBits,  // prevent repainting
    break: lineToBreak & unbrokenBits   // prevent rebreaking
  };
}

/* Modifies array of cubes based on input array */
function modifyLine(cubeLine, input) {
  for (let i = 0; i < cubeLine.length; i++) {
    cubeLine[i].painted |= ((input.paint & (1 << (cubeLine.length - i - 1))) != 0);
    cubeLine[i].broken |= ((input.break & (1 << (cubeLine.length - i - 1))) != 0);
    if (cubeLine[i].broken && cubeLine[i].solid) {
      cubeLine[i].broken = false;
    }
  }
  return cubeLine;
}

/*******************/
/* Array functions */
/*******************/

/* Creates a random sequence of numbers from 0 to n-1. */
function shuffledNumbers(n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    arr[i] = i;
  }
  return shuffle(arr);
}

/* Randomly sorts an array. */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fastReduce(arr, reducer, initialValue = arr[0]) {
  let accumulator = initialValue;
  for (let i = 0; i < arr.length; i++) {
    accumulator = reducer(accumulator, arr[i], i, arr);
  }
  return accumulator
}

/*********************/
/* Numeric functions */
/*********************/

/* Returns a random integer uniformly between min (inclusive) and max (exclusive) */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function computeDistanceSquared(a, b) {
  return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
}

/* Returns an array of all possible expansions for a clue in a line of 
 * finite width */
function findValidCompositions(clueCount, clueGroups, lineWidth) {
  let compsFound = [];
  findCompositions(compsFound, clueCount, clueGroups);
  return compsFound.filter(comp => (clueCount + comp.length - 1) <= lineWidth);
}

/* Finds all possible expansions for a clue size */
function findCompositions(compsFound, clueCount, clueGroups) {
  // triple+ expansion
  if (clueGroups > 2) {
    let comp = [];
    for (let i = 0; i < clueCount; i++) {
      // start with all 1s
      comp.push(1);
    }
    compsFound.push(comp);
    findSets(compsFound, comp.slice(0), 0);
  }
  // double expansion
  else {
    for (let i = 1; i < clueCount; i++) {
      compsFound.push([i, clueCount - i]);
    }
  }
}

/* Recursively create expansion sets */
function findSets(setsFound, set, start) {
  // remove last element
  if (set.length <= 3 || (set.pop() != 1)) {
    return;
  }
  // add 1 to each element before recursing
  for (let i = start; i < set.length; i++) {
    set[i] += 1;
    setsFound.push(set.slice(0));
    findSets(setsFound, set.slice(0), i)
    set[i] -= 1;
  }
}

/*********************/
/* Bitwise functions */
/*********************/

/* Returns a number consisting of x consecutive set bits */
function ones(x) {
  return 2 ** x - 1;
}

/* Returns the maximum number of consecutive set bits of x */
function countMaxConsecutiveOnes(x) {
  let count = 0;
  while (x != 0) {
    x = (x & (x << 1));
    count++;
  }
  return count;
}

/* Returns array of numbers formed by set bits of x */
function makeSingles(x) {
  let copy = x;
  let blocks = [];
  let prev = 0;
  for (let i = 1; x; i++) {
    if (x & 1) {
      blocks.push(ones(i) & copy ^ prev);
      prev |= (ones(i) & copy);
    }
    x >>= 1;
  }
  return blocks;
}

/* Returns array of numbers formed by consecutive set bits of a number, from
 * least significant to most significant bits. */
function makeBlocks(x) {
  let copy = x;
  let blocks = [];
  let prev = 0;
  for (let i = 1; x; i++) {
    if ((x & 1) && !((x >> 1) & 1)) {
      blocks.push(ones(i) & copy ^ prev);
      prev |= (ones(i) & copy);
    }
    x >>= 1;
  }
  return blocks;
}

/* Returns number formed by merging array elements bitwise */
function mergeBlocks(arr) {
  let bits = 0;
  for (let i = 0; i < arr.length; i++) {
    bits |= arr[i];
  }
  return bits;
}

/* Returns count of set bits */
function countOnes(x) {
  let c = 0;
  for (c = 0; x; c++) {
    x &= x - 1;
  }
  return c;
}

/* Returns the reverse of the n least-significant bits of x */
function reverseNBits(x, n) {
  let r = x & 1;
  while ((--n)) {
    x >>= 1;
    r <<= 1;
    r |= x & 1;
  }
  return r;
}