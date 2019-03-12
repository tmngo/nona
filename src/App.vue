<template>
  <div id="app" @mouseup="disablePaint" @mousedown.right.prevent>

    <div id="home"><a href="https://ngotm.github.io">ngotm.github.io</a></div>

      <NonaCanvas 
        v-show="!loading"
        :n="n" 
        :cubes="cubeArr" 
        :cube-visibility="cubeVisibility"
        :cube-highlight="cubeHighlight"
        :clue-grids="clueGrids"
        :section-x="sectionX"
        :section-y="sectionY"
        :controls="controls"
        @painton="enablePaint"
        @paint="paintCube"
        @breakon="enableBreak"
        @break="breakCube"
      ></NonaCanvas>

      <svg 
        v-show="loading" 
        id="loading" 
        viewBox="-38 -38 76 76"
        width="800">
        <polygon 
          points="0,-30 25.98,-15 25.98,15 0,30 -25.98,15 -25.98,-15 0,-30  2.598,-28.5"
          :stroke-dasharray="`${90*progress} ${90*(1-progress)}`"
        />
      </svg>
    

    <div class="slider slider-left">
      <input type="range" 
        v-model.number="sectionX" 
        :disabled="sectionY != n+1" 
        @dblclick="resetSectionView()"
        :style="{opacity: (sectionY != n+1) ? 0.4 : 1}" 
        min="1" :max="n+1"/>
    </div>

    <div class="slider slider-right">
      <input 
        type="range" 
        v-model.number="sectionY" 
        :disabled="sectionX != 1" 
        @dblclick="resetSectionView()"
        :style="{ opacity: (sectionX != 1) ? 0.4 : 1 }" 
        min="1" :max="n+1"/>
    </div>

    <div class="controls">
      <svg @click="swapControls" viewBox="-48 -48 96 96">

        <rect x="-16" y="-48" width="64" height="64" stroke="black" stroke-width="2" fill="white"/>
        <line x1="-16" y1="16" x2="48" y2="-48"/>
        <line x1="-16" y1="-48" x2="48" y2="16"/>
        <transition name="fade">
          <rect v-show="controls.paint === 2" x="-15" y="-47" width="62" height="62" stroke="white" stroke-width="2" fill="hsl(180, 50%, 50%)"/>
        </transition>
        <rect x="-16" y="-48" width="64" height="64" stroke="black" stroke-width="1" fill="none"/>

        <rect x="-48" y="-16" width="64" height="64" stroke="black" stroke-width="2" fill="white"/>
        <line x1="-48" y1="48" x2="16" y2="-16"/>
        <line x1="-48" y1="-16" x2="16" y2="48"/>
        <transition name="fade">
          <rect v-show="controls.paint === 0" x="-47" y="-15" width="62" height="62" stroke="white" stroke-width="2" fill="hsl(180, 50%, 50%)"/>
        </transition>
        <rect x="-48" y="-16" width="64" height="64" stroke="black" stroke-width="1" fill="none"/>
        <text x="50" y="15" fill="white">R</text>
        <text x="18" y="47" fill="white">L</text>

      </svg>
    </div>

    <div class="menu">
      <button class="menu-btn" @click="showMenu = !showMenu">Menu</button>

      <div v-show="showMenu" class="submenu">
        <input type="range" min="2" max="7" v-model.number="newN"/>
        <p>N = {{ newN }}</p>

        <input type="range" min="0.1" max="0.9" step="0.1" v-model.number="newDensity"/>
        <p>density = {{ newDensity }}</p>

        <input type="range" min="0" max="1" step="0.1" v-model.number="newRemoval"/>
        <p>clue removal = {{ newRemoval }}</p>

        <button @mousedown="loading = true" @click="generatePuzzle(newN, newDensity)">Generate Puzzle</button>  
        <button @click="resetPuzzle">Reset Puzzle</button>

      </div>

      <div v-show="showMenu" class="submenu">
        <p>remaining = {{ this.n**3 - numSolid - numBroken }}</p>
        <p>strikes = {{ strikes }}</p>
      </div>

      <div v-show="showMenu" class="submenu">
        <button @click="solveN(1)">Solve Iteration</button>
        <button @click="solve">Solve Complete</button>
      </div>

      <div v-show="showMenu" class="submenu">
        <a class="link" href="https://github.com/ngotm/nona">Help</a>
      </div>

    </div>

  </div>
</template>

<script>
import NonaCanvas from './components/NonaCanvas.vue'

export default {
  name: 'app',
  components: {
    NonaCanvas,
  },
  data() {
    return {
      grid: [],
      sections: [],
      newN: 5,
      newDensity: 0.3,
      newRemoval: 0,
      n: 4,
      density: 0.3,
      loading: false,
      paintEnabled: false,
      breakableId: "",
      paintType: true,
      progress: 0,
      sectionX: 1,
      sectionY: 5,
      strikes: 0,
      showMenu: false,
      controls: {
        break: 2,
        paint: 0,
      },
      reducerPainted: (accumulator, cube) => ((accumulator << 1) + cube.painted),
      reducerUnbroken: (accumulator, cube) => ((accumulator << 1) + !cube.broken),
    }
  },
  computed: {
    cubeArr() {
      return this.grid.flat(2);
    },
    cubeVisibility() {
      let arr = [];
      for (let i = 0; i < this.cubeArr.length; ++i) {
        let cube = this.cubeArr[i];
        arr[i] = !cube.broken && cube.j < this.sectionY && cube.i < this.n+2-this.sectionX;
      }
      return arr;
    },
    cubeHighlight() {
      let arr = [];
      for (let i = 0; i < this.cubeArr.length; ++i) {
        let cube = this.cubeArr[i];
        arr[i] = (cube.j == this.sectionY-1 && this.sectionX == 1) 
          || (cube.i == -(this.sectionX-this.n-1) && this.sectionY == this.n+1) 
          || (this.sectionY==this.n+1 && this.sectionX==1);
      }
      return arr;
    },
    numSolid() {
      return this.fastReduce(this.cubeArr, (count, cube) => (count + cube.solid), 0);
    },
    numPainted() {
      return this.fastReduce(this.cubeArr, (count, cube) => (count + cube.painted), 0);
    },
    numBroken() {
      return this.fastReduce(this.cubeArr, (count, cube) => (count + cube.broken), 0);
    },
    arr() {
      let arr = []
      for (let i = 0; i < this.n; i++) {
        arr.push(i)
      }
      return arr
    },
    lines() {
      return {
        t: this.arr.map(y => this.arr.map(x => this.grid[x][y])),
        l: this.arr.map(z => this.arr.map(y => this.arr.map(x => this.grid[x][y][z]))), 
        r: this.arr.map(z => this.arr.map(x => this.arr.map(y => this.grid[x][y][z])))
      };
    },
    clueGrids() {
      return {
        t: this.lines.t.map(row => row.map(line => this.createClueFromLine(line))),
        l: this.lines.l.map(row => row.map(line => this.createClueFromLine(line))),
        r: this.lines.r.map(row => row.map(line => this.createClueFromLine(line)))
      }
    },
    cubeLinesL() {
      return this.arr.map(z => this.arr.map(y => this.arr.map(x => this.grid[x][y][z]))).flat();
    },
    cubeLinesR() {
      return this.arr.map(z => this.arr.map(x => this.arr.map(y => this.grid[x][y][z]))).flat();
    },
    cubeLinesT() {
      return this.arr.map(y => this.arr.map(x => this.grid[x][y])).flat();
    },
    cubeLines() {
      return {
        l: this.cubeLinesL,
        r: this.cubeLinesR,
        t: this.cubeLinesT,
      }
    },
    cluesL() {
      return this.clueGrids.l.flat();
    },
    cluesR() {
      return this.clueGrids.r.flat();
    },
    cluesT() {
      return this.clueGrids.t.flat();
    },
    clues() {
      return {
        l: this.cluesL,
        r: this.cluesR,
        t: this.cluesT
      }
    },
    clueList() {
      return this.clues.l.concat(this.clues.r, this.clues.t);
    },
    paintedL() { // start0001end
      return this.cubeLinesL.map(line => this.fastReduce(line, this.reducerPainted, 0))
    },
    paintedR() { // start0001end
      return this.cubeLinesR.map(line => this.fastReduce(line, this.reducerPainted, 0))
    },
    paintedT() { // start0001end
      return this.cubeLinesT.map(line => this.fastReduce(line, this.reducerPainted, 0))
    },
    painted() {
      return {
        l: this.paintedL,
        r: this.paintedR,
        t: this.paintedT
      }
    },
    unbrokenL() { // start0001end
      return this.cubeLinesL.map(line => this.fastReduce(line, this.reducerUnbroken, 0))
    },
    unbrokenR() { // start0001end
      return this.cubeLinesR.map(line => this.fastReduce(line, this.reducerUnbroken, 0))
    },
    unbrokenT() { // start0001end
      return this.cubeLinesT.map(line => this.fastReduce(line, this.reducerUnbroken, 0))
    },
    unbroken() {
      return {
        l: this.unbrokenL,
        r: this.unbrokenR,
        t: this.unbrokenT
      }
    },
    solved() {
      return (this.n**3 - this.numSolid - this.numBroken) === 0 && (this.numPainted === this.numSolid);
    }
  },
  created: function () {
    this.generateRandomPuzzle(4, this.density);
  },
  methods: {

/* eslint-disable */
    
    /*********************/
    /* Puzzle generation */ 
    /*********************/

    generateRandomPuzzle(size, density) {
      this.n = size;
      this.density = density;
      let puzzle = [];
      for (let i = 0 ; i < size; i++) { 
        puzzle[i] = [];
        for (let j = 0; j < size; j++) {
          puzzle[i][j] = [];
          for (let k = 0; k < size; k++) {
            puzzle[i][j][k] = {
              id: i + "," + j + "," + k,
              i: i,
              j: j,
              k: k,
              solid: Math.random() < this.density,
              painted: false,
              broken: false,
              selected: false,
            }
          }
        } 
      }
      this.sectionX = 1;
      this.sectionY = this.n + 1;
      this.grid = puzzle;

    },

    generatePuzzle(size, density) {
      this.generateRandomSolvablePuzzle(size, density);
      if (this.newRemoval === 0) {
        this.sectionX = 1;
        this.sectionY = this.n + 1;
        this.resetPuzzle();
        this.loading = false;
        return;
      }
      this.removeClues(this.newRemoval);      
    },

    generateRandomSolvablePuzzle(size, density) {
      let iterations = 1;
      this.progress = 1;
      do {
        this.generateRandomPuzzle(size, density)
        console.log(iterations);
      }
      while (iterations++ < 20 && !this.solve());
      console.log('unsolved: ' + (iterations - 1) + ' solved: ' + (this.solved ? 1 : 0));
    },

    removeClues(frac = 1, i = 0, removed = 0) {
      let numClues = Math.min(Math.round(frac * 3*this.n*this.n), 3*this.n*this.n)
      let arr = this.shuffledNumbers(numClues)
      removed += this.removeClue(arr, i++);
      if (i % 3 === 0 && i < numClues) {
        this.progress = (i + 1) / numClues;
        setTimeout(this.removeClues, 1, frac, i, removed);
      } else if (i < numClues) {
        this.removeClues(0.4, i, removed)
      } else {
        this.sectionX = 1;
        this.sectionY = this.n + 1;
        this.resetPuzzle();
        this.loading = false;
        this.progress = 0;
        console.log(`removed: ${removed}`)
      }
    },

    removeClue(arr, i) {
      this.resetPuzzle();
      let f = arr[i] % 3;
      let p = parseInt(arr[i] / 3 / this.n);
      let q = parseInt(arr[i] / 3) % this.n;
      this.clueGrids['lrt'[f]][p][q].isVisible = false;
      if (!this.solve()) {
        this.clueGrids['lrt'[f]][p][q].isVisible = true;
      }
      return !this.clueGrids['lrt'[f]][p][q].isVisible
    },

    resetPuzzle() {
      for (let i = 0; i < this.cubeArr.length; i++) {
        let cube = this.cubeArr[i];
        cube.painted = false;
        cube.broken = false;
      }
      for (let i = 0; i < this.n*this.n; i++) {
        this.clues.l[i].isSolved = false;
        this.clues.r[i].isSolved = false;
        this.clues.t[i].isSolved = false;
      }
    },

    createClueFromLine(line) {
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
    },

    /******************/
    /* Input handling */
    /******************/

    enablePaint(x, y, z) {
      this.paintEnabled = true;
      this.paintType = !this.grid[x][y][z].painted;
      this.paintCube(x, y, z);
    },

    enableBreak(id) {
      if (this.breakableId === "") {
        this.breakableId = id;
      }
    },

    disablePaint() {
      this.paintEnabled = false;
    },

    paintCube(x, y, z) {
      if (this.paintEnabled) {
        this.grid[x][y][z].painted = this.paintType;
      }
    },

    breakCube(x, y, z) {
      if (this.grid[x][y][z].id !== this.breakableId || this.grid[x][y][z].painted) {
        this.breakableId = "";
        return;
      }
      if (!this.grid[x][y][z].solid) {
        this.grid[x][y][z].broken = true;
      } else {
        this.strikes++;
      }
      this.breakableId = "";
    },

    swapControls() {
      let tmp = this.controls.break;
      this.controls.break = this.controls.paint;
      this.controls.paint = tmp;
    },

    resetSectionView() {
      this.sectionY = this.n+1;
      this.sectionX = 1;
    },

    /***********/
    /* Solving */
    /***********/

    /* Solves every line of every face until no progress is made. */
    repeatSolve(newN, newDensity, n) {
      for (let i = 0; i < n; i++) {
        this.generateRandomPuzzle(newN, newDensity); 
        this.solve()
      }
    },

    /* Solves every line of every face until no progress is made. */
    solve() {
      let currentBroken = this.numBroken;
      let currentPainted = this.numPainted;
      do {
        currentBroken = this.numBroken;
        currentPainted = this.numPainted;
        this.solveFaces(this.n);
      } while ((currentBroken !== this.numBroken) && (currentPainted !== this.numPainted))
      // if ((currentBroken !== this.numBroken) && (currentPainted !== this.numPainted)) {
      //   setTimeout(this.solve, 150);
      // }
      return this.numBroken === (this.n**3 - this.numSolid) && (this.numPainted === this.numSolid);
    },

    solveFaces() {
      this.solveLines(this.n, "t");
      this.solveLines(this.n, "r");
      this.solveLines(this.n, "l");
    },

    solveN(n) {
      for (let i = 0; i < n; i++) {
        this.solveFaces(this.n);
      }
      // console.log(n);
    },

    /* Solves each line of a given face once. */
    solveLines(n, face) {
      let cubes = this.cubeLines[face];
      let clues = this.clues[face];
      let painted = this.painted[face];
      let unbroken = this.unbroken[face];
      for (let i = 0; i < n*n; i++) {
        if ((!clues[i].isSolved) && (clues[i].isVisible)) {
          let output = this.solveLine(painted[i], unbroken[i], n, clues[i].count, clues[i].groups);
          this.modifyLine(cubes[i], output);
          if (painted[i] === unbroken[i]) {
            clues[i].isSolved = true;
          }
        }
      }
    },

    /* Builds the rightmost (least-significant) solution of a line, without 
     * accounting for known (painted) solids. */
    placeRightSimple(blockSizes, unbrokenBits) {
      let blockBits = 0;
      let blocks = [];
      for (let i = 0; i < blockSizes.length; i++) {
        let block = this.ones(blockSizes[i]);
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
    },

    /* Builds the rightmost (least-significant) solution of a line, accounting 
     * for known (painted) solids. 
     * 
     * blocks:        [1, 2, 1, 3, ...]
     * unbrokenBits:  1111101111
     * paintedBits:   0000100000
     * */
    placeRightComplex(blockSizes, unbrokenBits, paintedBits) {

      // initial simple placement
      let blocks = this.placeRightSimple(blockSizes, unbrokenBits);
      let i = blocks.length;

      // if simple placement fails, return
      if (i === 0) return [];

      let blockBits = this.mergeBlocks(blocks);
      let paintBlocks = this.makeSingles(paintedBits); // L -> R
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
            let leftBlocks = blocks.slice(i+1);
            let leftBlockBits = this.mergeBlocks(leftBlocks);
            let rightBlockBits = this.mergeBlocks(blocks.slice(0, i));
            
            // if this is a valid position (on unbroken blocks)
            if (((leftmostBlock & unbrokenBits) === leftmostBlock)) {

              // if left blocks overlap and need to be repositioned
              if ((leftmostBlock | (leftmostBlock << 1)) & leftBlockBits) {
                // reposition all blocks to the left of this block
                let freeBits = ~this.ones(leftmostBlock.toString(2).length + 1) & unbrokenBits;
                let leftBlockSizes = leftBlocks.map(x => this.countOnes(x));
                let movedLeftBlocks = this.placeRightSimple(leftBlockSizes, freeBits);    
                if (leftBlocks.length && !movedLeftBlocks.length) {
                  return [];
                }
                leftBlockBits = this.mergeBlocks(movedLeftBlocks);
              }
              
              // re-merge changed blocks
              blockBits = leftBlockBits | leftmostBlock | rightBlockBits;
              blocks = this.makeBlocks(blockBits);
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

    },

    /* Builds the rightmost (least-significant) solution of a line, accounting 
     * for known (painted) solids. */
    placeRight(blockSizes, unbrokenBits, paintedBits) {
      return (paintedBits) ? this.placeRightComplex(blockSizes, unbrokenBits, paintedBits)
          : this.placeRightSimple(blockSizes, unbrokenBits);
    },

    /* Builds the leftmost (most-significant) solution of a line, accounting 
     * for known (painted) solids. */
    placeLeft(blockSizes, unbrokenBits, paintedBits, lineWidth) {
      unbrokenBits = this.reverseNBits(unbrokenBits, lineWidth);
      paintedBits = this.reverseNBits(paintedBits, lineWidth);
      return this.placeRightComplex(blockSizes.reverse(), unbrokenBits, paintedBits)
          .map(x => this.reverseNBits(x, lineWidth), this).reverse();
    },

    /* Solves line and returns bits corresponding to cubes deduced to be solid 
     * and cubes deduced to be empty. */
    solveLine(paintedBits, unbrokenBits, lineWidth, clueCount, clueGroups) {
      let ones = this.ones(lineWidth);
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
      if (clueCount === this.countOnes(unbrokenBits)) {
        lineToPaint = unbrokenBits;
      }
      // Complete break
      else if (clueCount === this.countOnes(paintedBits)) {
        lineToBreak = unbrokenBits && ~paintedBits;
      }
      // Single left-right solve (totally unbroken, unpainted)
      else if (clueGroups === 1 && paintedBits === 0 && unbrokenBits === ones) {
        let rightBlock = this.ones(clueCount);
        let leftBlock = rightBlock << (lineWidth - clueCount);
        lineToPaint = leftBlock & rightBlock;
      } 
      // Single left-right solve (general)
      else if (clueGroups === 1) {
        let rightBlock = this.ones(clueCount);
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
          lineToBreak = ones ^ (leftBlock | rightBlock);
        } else {
          let unbrokenBlocks = this.makeBlocks(unbrokenBits);
          for (let i = 0; i < unbrokenBlocks.length; i++) {
            if (this.countOnes(unbrokenBlocks[i]) < clueCount) {
              lineToBreak |= unbrokenBlocks[i]
            }
          }
        }
      }
      // Double (totally unbroken, width-1)
      else if (clueGroups == 2 && unbrokenBits == ones && (clueCount === lineWidth - 1)) {
        lineToPaint = (1 << (lineWidth - 1)) + 1;
      }
      // Double (contiguous unbroken, width-1)
      else if (clueGroups == 2 
          && (this.countOnes(unbrokenBits) == this.countMaxConsecutiveOnes(unbrokenBits)) 
          && (clueCount === this.countOnes(unbrokenBits) - 1)) {
        lineToPaint = (1 << (this.countOnes(unbrokenBits) - 1)) + 1;
        while ((lineToPaint & unbrokenBits) != lineToPaint) {
          lineToPaint <<= 1;
        }
      }
      // Double / triple (general)
      else if (clueGroups > 1) {
        // console.log('[' + lineWidth + ', ' + clueCount + ', ' + clueGroups + ', 0b' 
        //     + unbrokenBits.toString(2) + ', 0b' + paintedBits.toString(2) + ', 0b0, 0b0]')

        let permutations = this.findValidCompositions(clueCount, clueGroups, lineWidth);
        let possibleSolids = [];
        let possibleEmptys = [];
        for (let i = 0; i < permutations.length; i++) {
          let blockSizes = permutations[i];
          // console.log(blockSizes);
          let right = this.placeRight(blockSizes, unbrokenBits, paintedBits);
          // console.log("r " + right.map(x => x.toString(2)))
          let left = this.placeLeft(blockSizes, unbrokenBits, paintedBits, lineWidth);
          // console.log("l " + left.map(x => x.toString(2)))

          // Skip permutation if it cannot be placed
          if (right.length === 0 || left.length === 0) {
            continue;
          }
          // console.log("R " + this.mergeBlocks(right).toString(2))
          // console.log("L " + this.mergeBlocks(left).toString(2))

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
            for (let b = 0;  b < right.length; b++) {
              if (((cell <= left[b]) && (cell >= right[b])) || ((cell & right[b]) !== 0)) {
                cell = 0;
                break;
              }
            }
            empty |= cell;
          }

          // Determine empty cubes based on adjacency to complete blocks
          let paintBlocks = this.makeBlocks(paintedBits);
          if (((this.countOnes(paintedBits) === clueCount - 1)
              && ((clueGroups === 2 && paintBlocks.length === 1) 
              || (clueGroups > 2 && paintBlocks.length === 2))) 
              || (clueGroups > 2 && this.countMaxConsecutiveOnes(paintedBits) === clueCount - 2)) {
            let adjacent = (paintedBits << 1 | paintedBits >> 1) & ~paintedBits;
            adjacent = adjacent & ones;
            empty |= adjacent;
            empty = (empty & ~solid) & ones;
          }
          possibleEmptys.push(empty);

          // console.log("solid: " + solid.toString(2))
          // console.log("empty: " + empty.toString(2))
        }
        // Merge all potential solutions
        lineToPaint = (possibleSolids.length) ? this.fastReduce(possibleSolids, (bits, p) => (bits & p)) : 0;
        lineToBreak = (possibleEmptys.length) ? this.fastReduce(possibleEmptys, (bits, b) => (bits & b)) : 0;
      }
      return {
        paint: lineToPaint & ~paintedBits,  // prevent repainting
        break: lineToBreak & unbrokenBits   // prevent rebreaking
      };
    },

    testLines() {
      const cases = [
        [4, 2, 2, 0b1011, 0b0000, 0b0000, 0b1000],      // double, paint island
        [5, 2, 2, 0b11111, 0b00100, 0b01010, 0b00000],  // double, break adjacent
        [5, 3, 2, 0b11101, 0b00000, 0b00000, 0b01001],  // double, paint island + center
        [5, 3, 2, 0b11111, 0b00000, 0b00000, 0b00000],  // double, not enough data
        [5, 3, 2, 0b10111, 0b10010, 0b00000, 0b00000],  // double, no new data
        [5, 3, 2, 0b11101, 0b00101, 0b10000, 0b01000],  // double, complete from edge
        [5, 3, 2, 0b11111, 0b11000, 0b00100, 0b00000],  // double, break adjacent
        [5, 3, 3, 0b11111, 0b00000, 0b01010, 0b10101],  // triple, complete
        [6, 4, 3, 0b111111, 0b000000, 0b000000, 0b100001],  // triple, minimum size
        [7, 2, 2, 0b1111111, 0b0000010, 0b0000101, 0b0000000],  // double, break adjacent
        [7, 3, 2, 0b1111001, 0b0011000, 0b0100000, 0b0000000], // double, break adjacent
        [7, 3, 3, 0b1010101, 0b1000001, 0b0000000, 0b0000000],  // triple, no new data
        [7, 4, 2, 0b1111111, 0b1001010, 0b0110001, 0b0000100],  // double, one valid perm
        [7, 4, 3, 0b1110111, 0b1000010, 0b0100000, 0b0010000],  // triple, one valid perm
        [8, 4, 2, 0b11111001, 0b01000001, 0b00001000, 0b00100000],  // double, partial from edge
        [8, 4, 3, 0b10111111, 0b00101100, 0b00010010, 0b00000000],  // triple, break adjacent
        [8, 5, 3, 0b11111111, 0b00011001, 0b00000000, 0b00000000],  // triple, not enough info
        [8, 6, 3, 0b11101111, 0b11101100, 0b00000010, 0b00000001],  // triple, break adjacent, complete
        [9, 3, 3, 0b111111111, 0b000001000, 0b000010100, 0b000000000],
        [10, 3, 1, 0b1011101111, 0b0000000000, 0b1000000000, 0b0000000000], // single, LR separate

      ];
      let total = true;
      for (let i = 0; i < cases.length; i++) {
        let c = cases[i];
        let result = this.testLine(c[0], c[1], c[2], c[3], c[4], c[5], c[6]);
        total = total && result;
      }
      console.log(total);
    },

    testPlaceRight() {
      const cases = [
        // [[2, 2], 0b11111001, 0b01000001, 8],
        // [[2, 1, 1], 0b1110111, 0b1000010, 7],
        // [[1, 1, 2], 0b1110111, 0b1000010, 7],
        // [[1, 2, 1], 0b1110111, 0b1000010, 7],
        // [[1, 1, 1, 1], 0b1110111, 0b1000010, 7],
        // [[1, 1], 0b1111111, 0b0000010, 7],
        // [[3, 1], 0b1111111, 0b1001010, 7],
        // [[1, 2, 1, 1], 0b11111111, 0b11001, 8],
        // [[1, 1, 3], 0b11111111, 0b11001, 8]
        // [[1,1,1,1],0b10111111, 0b00101100,8]
        [[1,2],0b1111001, 0b0011000,7],
        [[2,1],0b1001111, 0b0001100,7]
      ];
      for (let i = 0; i < cases.length; i++) {
        let c = cases[i];
        console.log(c[0]);
        console.log('R ' + this.mergeBlocks(this.placeRight(c[0], c[1], c[2])).toString(2));
        console.log('L ' + this.mergeBlocks(this.placeLeft(c[0], c[1], c[2], c[3])).toString(2));
      }
    },

    testLine(width, count, groups, unbroken, painted, solnB, solnP) {
      let soln = this.solveLine(painted, unbroken, width, count, groups);
      console.log("------ " + count + ' / ' + groups + " ------")
      console.log("painted: " + painted.toString(2))
      console.log('unbroke: ' + unbroken.toString(2))
      console.log("paint: " + soln.paint.toString(2));
      console.log("break: " + soln.break.toString(2));
      return solnP === soln.paint && solnB === soln.break;
    },

    /* Modifies array of cubes based on input array */
    modifyLine(cubeLine, input) {
      for (let i = 0; i < cubeLine.length; i++) {
        let cube = cubeLine[i];
        cube.painted |= ((input.paint & (1 << (cubeLine.length - i - 1))) != 0);
        cube.broken |= ((input.break & (1 << (cubeLine.length - i - 1))) != 0);
        if (cube.broken && cube.solid) {
          this.strikes++;
          cube.broken = false;
          console.log("strike");
        }
      }
    },
    
    /*******************/
    /* Array functions */
    /*******************/

    shuffledNumbers(n) {
      let arr = [];
      for (let i = 0; i < n; i++) {
        arr[i] = i;
      }
      return this.shuffle(arr);
    },

    shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    fastReduce(arr, reducer, initialValue = arr[0]) {
      let accumulator = initialValue;
      for (let i = 0; i < arr.length; i++) {
        accumulator = reducer(accumulator, arr[i], i, arr);
      }
      return accumulator
    },

    /*********************/
    /* Numeric functions */
    /*********************/

    

    /* Returns a random integer uniformly between min and max, inclusive */
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min; 
    },

    /* Returns an array of all possible expansions for a clue in a line of 
     * finite width */
    findValidCompositions(clueCount, clueGroups, lineWidth) {
      let compsFound = [];
      this.findCompositions(compsFound, clueCount, clueGroups);
      return compsFound.filter(comp => (clueCount + comp.length - 1) <= lineWidth);
    },

    /* Finds all possible expansions for a clue size */
    findCompositions(compsFound, clueCount, clueGroups) {
      // triple+ expansion
      if (clueGroups > 2) {
        let comp = [];
        for (let i = 0; i < clueCount; i++) {
          // start with all 1s
          comp.push(1);
        }
        compsFound.push(comp);
        this.findSets(compsFound, comp.slice(0), 0);
      } 
      // double expansion
      else {
        for (let i = 1; i < clueCount; i++) {
          compsFound.push([i, clueCount - i]);
        }
      }
    },

    /* Recursively create expansion sets */
    findSets(setsFound, set, start) {
      // remove last element
      if (set.length <= 3 || (set.pop() != 1)) {
        return;
      }
      // add 1 to each element before recursing
      for (let i = start; i < set.length; i++) {
        set[i] += 1;
        setsFound.push(set.slice(0));
        this.findSets(setsFound, set.slice(0), i)
        set[i] -= 1;
      }
    },

    /*********************/
    /* Bitwise functions */
    /*********************/

    /* Returns a number consisting of x consecutive set bits */
    ones(x) {
      return 2 ** x - 1;
    },

    /* Returns the maximum number of consecutive set bits of x */
    countMaxConsecutiveOnes(x) {
      let count = 0;
      while (x != 0) {
        x = (x & (x << 1));
        count++;
      }
      return count;
    },

    /* Returns array of numbers formed by set bits of x */
    makeSingles(x) {
      let copy = x;
      let blocks = [];
      let prev = 0;
      for (let i = 1; x; i++) {
        if (x & 1) {
          blocks.push(this.ones(i) & copy ^ prev);
          prev |= (this.ones(i) & copy);
        }
        x >>= 1;
      }
      return blocks;
    },

    /* Returns array of numbers formed by consecutive set bits of a number, from
     * least significant to most significant bits. */
    makeBlocks(x) {
      let copy = x;
      let blocks = [];
      let prev = 0;
      for (let i = 1; x; i++) {
        if ((x & 1) && !((x >> 1) & 1)) {
          blocks.push(this.ones(i) & copy ^ prev);
          prev |= (this.ones(i) & copy);
        }
        x >>= 1;
      }
      return blocks;
    },

    /* Returns number formed by merging array elements bitwise */
    mergeBlocks(arr) {
      let bits = 0;
      for (let i = 0; i < arr.length; i++) {
        bits |= arr[i];
      }
      return bits;
    },

    /* Returns count of set bits */
    countOnes(x) {
      let c = 0;
      for (c = 0; x; c++) {
        x &= x - 1;
      }
      return c;
    },

    /* Returns the reverse of the n least-significant bits of x */
    reverseNBits(x, n) {
      let r = x & 1;
      while ((--n)) { 
        x >>= 1;  
        r <<= 1;
        r |= x & 1;
      }
      return r;
    },

  }
}
</script>

<style lang="scss">
@import "./assets/fonts.scss";

$font-stack: FiraSans, "Helvetica Neue", "Helvetica", Arial, sans-serif;

@mixin transform($property) {
  transform: $property;
  -ms-transform: $property;
  -webkit-transform: $property;
}

@mixin box-shadow($property) {
  box-shadow: $property;
}

body {
  font: {
    family: FiraSans, Times, sans-serif !important;
    size: 1em;
    color: #2c3e50;
  }
  height: 100%;
  margin: 0;
  position: fixed;
  overflow-y: auto;
  overflow-x: hidden;
  text-rendering: optimizeLegibility; 
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
}

#home { 
  grid-area: header;
  justify-self: start;
  align-self: start;
  margin: 0.5em;
	a {
    color: #fff;
    font: {
      size: 0.75em;
      weight: bold;
    }
    text-decoration: none;
    height: 2em;
    line-height: 2em;
    margin: 0.75em;
    &:hover {
      color: white;
      text-decoration: underline;
    }
	}
}

#app {
  align-content: start;
  align-items: center;
  background-color: hsl(0, 0, 25%);
  display: grid;
  grid-gap: 0;
  grid-template: 
    "header header header header header" minmax(3em, auto)
    ". main main main ." 1fr
    ". left middle right ." auto
    "footer footer footer footer footer" 2em
    / 1fr minmax(0em, 30em) 10vh minmax(0em, 30em) 1fr; 
  height: 100%;
  justify-content: center;
  justify-items: center;
  margin: 0;
  position: relative;
  width: 100%;
}

#canvas {
  grid-area: main;
  max-height: 110%;
  max-width: 135%;
  position: relative;
}

#loading {
  @extend #canvas;
  polygon {
    stroke: #111; 
    fill: hsla(45, 20%, 80%, 0.7); 
    stroke-width: 2; 
    height: 100%;
  }
}

@mixin button() {
  font: {
    family: $font-stack;
    weight: 600;
    size: 1em;
  }
  text: {
    align: center;
    decoration: none;
  }
  white-space: nowrap;
  height: 2em;
  padding: 0 14px;
  box-shadow: 0 4px 6px rgba(50,50,93,.11),0 1px 3px rgba(0,0,0,.08);
  background: #fff;
  border-radius: 3px;
  line-height: 2em;
  text-transform: uppercase;
  color: #404040;
  border: none;
  -webkit-transition: all .15s ease;
  transition: all .15 s ease;
  &:focus, &:hover {
    background: hsl(180, 50%, 80%);
    color: #000;
    @include transform(translateY(-1px));
    box-shadow: 0 13px 27px -5px rgba(50,50,93,.25),0 8px 16px -8px rgba(0,0,0,.3);
    box-shadow: 0 7px 14px rgba(50,50,93,.1),0 3px 6px rgba(0,0,0,.08);
  }
  &:active {
    background: #fff;
    transform: translateY(1px);
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.menu {
  align-items: center;
  align-self: start;
  background: #000d;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  grid-area: header;
  justify-self: end;
  padding: 0.5em 0.25em;
  margin: 0.5em;
  position: absolute;
}

.link {
  @include button;
}

.menu-btn {
  @include button;
  align-self: flex-end;
  background: #0000 !important;
  color: white !important;
  font-size: 0.75em;
  height: 1.5em;
  line-height: 1.5em;
  margin: 0;
  padding: 0 .5em;
}

.submenu {
  align-items: stretch; 
  border: solid #333 1px;
  border-bottom: none;
  color: white;
  display: flex;
  font-size: 0.75em;
  flex-direction: column;
  justify-content: space-around;
  padding: 0.25em 0.25em;
  width: 90%;
  z-index: 10;
  button {
    @include button;
    margin: 0.2em;
  }
  a, p {
    margin: 0.2em;
  }
  &:last-child {
    border-bottom: solid #444 1px;
  }
}

.controls {
  align-items: flex-start;
  display: flex; 
  grid-area: middle;
  height: 100%;
  justify-content: center; 
  transition: all .15s ease;
  svg {
    overflow: visible;
    width: 10vh; 
    height: 10vh;
    &:hover, &:focus {
      transform: translateY(-1px);
    }
    &:active {
      transform: translateY(1px);
    }
    line {
      stroke: #444;
      stroke-width: 3px;
    }
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .25s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}

@mixin track() {
  width: 90%;
  background: transparent;
  border: none;
}

@mixin thumb($image) {
  width: 5.5em;
  height: 5.5em;
  border: none;
  -webkit-appearance: none;
  background: transparent url($image) no-repeat;
}

.slider {
  align-self: start;
  height: 100%;
  input {
    -webkit-appearance: none;
    background: none;
    width: 25vw;
    min-width: 13em;
    max-width: 20em;
    &::-webkit-slider-runnable-track { @include track }
    &::-moz-range-track { @include track }
    &::-ms-track { @include track }
  }
}

.slider-left {
  grid-area: left;
  justify-self: start;
  margin-left: 1em;
  input {
    float: left;
    transform-origin: left;
    transform: rotateZ(-30deg); 
    &::-webkit-slider-thumb { @include thumb("./assets/redcursor.svg") }
    &::-moz-range-thumb { @include thumb("./assets/redcursor.svg") }
    &::-ms-thumb { @include thumb("./assets/redcursor.svg") }
  }
}

.slider-right {
  grid-area: right;
  justify-self: end;
  margin-right: 1em;
  input {
    float: right;
    transform-origin: right;
    transform: rotateZ(30deg);
    &::-webkit-slider-thumb { @include thumb("./assets/greencursor.svg") }
    &::-moz-range-thumb { @include thumb("./assets/greencursor.svg") }
    &::-ms-thumb { @include thumb("./assets/greencursor.svg") }
  }
}

</style>
