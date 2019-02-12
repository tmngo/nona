<template>
  <div id="app" @mouseup="disablePaint">

    <svg id="nona-canvas" :viewBox="-55*n/2 + ' ' + -65*n/2 + ' ' + 55*n + ' ' + 65*n" @click.right.prevent>
      <NonaCube 
        v-for="(cube, i) in cubeArr" 
        v-show="cubeVisibility[i]"  
        :active="cubeHighlight[i]"
        :key="cube.id" 
        :cube="cube" 
        :clueGrids="clueGrids"
        @painton="enablePaint"
        @breakon="enableBreak(cube.id)"
        @break="breakCube(cube.i, cube.j, cube.k)"
        @paint="paintCube"
      ></NonaCube>
    </svg>

    <div class="slider slider-left">
      <input type="range" 
        v-model.number="sectionX" 
        :disabled="sectionY != n+1" 
        :style="{opacity: (sectionY != n+1) ? 0.4 : 1}" 
        min="1" :max="n+1"/>
    </div>
    <div class="slider slider-right">
      <input 
        type="range" 
        v-model.number="sectionY" 
        :disabled="sectionX != 1" 
        :style="{ opacity: (sectionX != 1) ? 0.4 : 1 }" 
        min="1" :max="n+1"/>
    </div>

    <div class="info">
      <input type="range" min="1" max="10" v-model.number="newN"/>
      <input type="range" min="0.1" max="0.9" step="0.1" v-model.number="newDensity"/>
      
      <p>newN = {{ newN }}, newDensity = {{ newDensity }}</p>
      <p>n = {{ n }}, density = {{ density }}</p>
      <p>solid = {{ numSolid }}, empty = {{ this.n**3 - numSolid }}</p>
      <p>painted = {{ numPainted }}, broken = {{ numBroken }}, remaining = {{ this.n**3 - numSolid - numBroken }}</p>
      <p>paintEnabled = {{ paintEnabled }}</p>
      <p>breakableId = {{ breakableId }}</p>
      <p>strikes = {{ strikes }}</p>
      <p>x = {{ sectionX }}, y = {{ sectionY }}</p>
      <button 
        @click="generateRandomGrid(newN, newDensity)"
      >New Puzzle</button>
      <button 
        @click="solve"
      >Solve Iteration</button>
      <button 
        @click="generateRandomGrid(newN, newDensity); solve()"
      >New Solve</button>
    </div>

  </div>
</template>

<script>
import NonaCube from './components/NonaCube.vue'

export default {
  name: 'app',
  components: {
    NonaCube,
  },
  data() {
    return {
      grid: [],
      sections: [],
      newN: 4,
      newDensity: 0.3,
      n: 4,
      density: 0.3,
      paintEnabled: false,
      breakableId: "",
      paintType: true,
      sectionX: 1,
      sectionY: 5,
      strikes: 0,
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
      return this.cubeArr.reduce((count, cube) => (count + cube.solid), 0);
    },
    numPainted() {
      return this.cubeArr.reduce((count, cube) => (count + cube.painted), 0);
    },
    numBroken() {
      return this.cubeArr.reduce((count, cube) => (count + cube.broken), 0);
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
        t: this.cubeLinesT
      }
    },
    cluesL() {
      return this.cubeLinesL.map(line => this.createClueFromLine(line)).flat();
    },
    cluesR() {
      return this.cubeLinesR.map(line => this.createClueFromLine(line)).flat();
    },
    cluesT() {
      return this.cubeLinesT.map(line => this.createClueFromLine(line)).flat();
    },
    clues() {
      return {
        l: this.cluesL,
        r: this.cluesR,
        t: this.cluesT
      }
    },
    paintedL() { // start0001end
      return this.cubeLinesL.map(line => line.reduce(this.reducerPainted, 0))
    },
    paintedR() { // start0001end
      return this.cubeLinesR.map(line => line.reduce(this.reducerPainted, 0))
    },
    paintedT() { // start0001end
      return this.cubeLinesT.map(line => line.reduce(this.reducerPainted, 0))
    },
    painted() {
      return {
        l: this.paintedL,
        r: this.paintedR,
        t: this.paintedT
      }
    },
    unbrokenL() { // start0001end
      return this.cubeLinesL.map(line => line.reduce(this.reducerUnbroken, 0))
    },
    unbrokenR() { // start0001end
      return this.cubeLinesR.map(line => line.reduce(this.reducerUnbroken, 0))
    },
    unbrokenT() { // start0001end
      return this.cubeLinesT.map(line => line.reduce(this.reducerUnbroken, 0))
    },
    unbroken() {
      return {
        l: this.unbrokenL,
        r: this.unbrokenR,
        t: this.unbrokenT
      }
    },
  },
  created: function () {
    this.generateRandomGrid(this.n, this.density);
  },
  methods: {

    /* Puzzle generation */ 

    generateRandomGrid(size, density) {
      this.n = size;
      this.density = density;
      this.grid = [];
      for (let i = 0 ; i < size; i++) { 
        this.grid.splice(i, 1, []);
        for (let j = 0; j < size; j++) {
          this.grid[i].splice(j, 1, []);
          for (let k = 0; k < size; k++) {
            this.grid[i][j].splice(k, 1, {
              id: i + "," + j + "," + k,
              i: i,
              j: j,
              k: k,
              solid: Math.random() < this.density,
              painted: false,
              broken: false,
              selected: false,
            });
          }
        } 
      }
      this.sectionX = 1;
      this.sectionY = this.n + 1;
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

    /* Input handling */

    enablePaint(x, y, z) {
      this.paintEnabled = true;
      this.paintType = !this.grid[x][y][z].painted;
      this.paintCube(x, y, z);
    },

    enableBreak(id) {
      if (this.breakableId==="") {
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

    /* Solving */

    solve() {
      let currentBroken = this.numBroken;
      let currentPainted = this.numPainted;
      do {
        currentBroken = this.numBroken;
        currentPainted = this.numPainted;
        this.solveLines(this.n, "t");
        this.solveLines(this.n, "r");
        this.solveLines(this.n, "l");
      } while ((currentBroken != this.numBroken) && (currentPainted != this.numPainted))
      return this.numBroken === (this.n**3 - this.numSolid)
    },

    solveLines(n, face) {
      let cubes = this.cubeLines[face];
      let clues = this.clues[face];
      let painted = this.painted[face];
      let unbroken = this.unbroken[face];
      for (let i = 0; i < n*n; i++) {
        if (!clues[i].isSolved) {
          let output = this.solveLine(painted[i], unbroken[i], n, clues[i].count, clues[i].groups);
          this.modifyLine(cubes[i], output);
          if (painted[i] === unbroken[i]) {
            clues[i].isSolved = true;
          }
        }
      }
    },
    
    placeRightSimple(blocks, lineUnbroken) {
      let placedBlocks = 0;
      let blocksPlaced = [];
      for (let i = 0; i < blocks.length; i++) {
        let block = this.ones(blocks[i]);
        while (((block | lineUnbroken)) != lineUnbroken || ((((block >> 1) | block) & placedBlocks) != 0)) {
          block <<= 1;
          if (block > lineUnbroken) return 0;
        }
        placedBlocks |= block;
        blocksPlaced.push(block)
      }
      return blocksPlaced;
    },

    paintedBlockPlacementRight(blocks, linePainted) {
      let blockBits = blocks.reduce((bits, block) => bits | block, 0);
      let paintBlocks = [];
      let paintBlock = 0;
      while (linePainted != 0) {
        if (linePainted & 1) {
          paintBlock << 1;
          paintBlock | 1;
        } else {
          paintBlocks.push(paintBlock);
          paintBlock << 1;
        }
      }
      while (blockBits & linePainted !== linePainted) { 
      }
    },

    placeLeftSimple(blocks, lineUnbroken, lineWidth) {
      lineUnbroken = this.reverseNBits(lineUnbroken, lineWidth);
      return this.placeRightSimple(blocks, lineUnbroken).reverse();
    },

    solveLine(linePainted, lineUnbroken, lineWidth, clueCount, clueGroups) {
      let ones = this.ones(lineWidth);
      let lineToPaint = 0;
      let lineToBreak = 0;

      // Paint complete
      if (clueCount == this.countOnes(lineUnbroken)) {
        lineToPaint = lineUnbroken;
      }
      // Break complete
      else if (clueCount == this.countOnes(linePainted)) {
        lineToBreak = lineUnbroken && ~linePainted;
      }
      // Single left-right solve (simple)
      else if (clueGroups === 1 && linePainted === 0 && lineUnbroken === ones) {
        let rightBlock = this.ones(clueCount);
        let leftBlock = rightBlock << (lineWidth - clueCount);
        lineToPaint = leftBlock & rightBlock;
      } 
      // Single left-right solve (general)
      else if (clueGroups === 1) {
        let rightBlock = this.ones(clueCount);
        let leftBlock = rightBlock << (lineWidth - clueCount);
        while (((rightBlock & linePainted) != linePainted) || ((rightBlock | lineUnbroken)) != lineUnbroken) {
          rightBlock = rightBlock << 1;
        }
        while (((leftBlock & linePainted) != linePainted) || ((leftBlock | lineUnbroken)) != lineUnbroken) {
          leftBlock = leftBlock >>> 1;
        }
        lineToPaint = linePainted ^ (leftBlock & rightBlock);
        if (leftBlock & rightBlock) {
          lineToBreak = ones ^ (leftBlock | rightBlock);
        }
      }
      else if (clueGroups == 2 && lineUnbroken == ones && (clueCount === lineWidth - 1)) {
        lineToPaint = (1 << (lineWidth - 1)) + 1;
      }
      else if (clueGroups == 2 && (this.countOnes(lineUnbroken) == this.countMaxConsecutiveOnes(lineUnbroken)) && (clueCount === this.countOnes(lineUnbroken) - 1)) {
        lineToPaint = (1 << (this.countOnes(lineUnbroken) - 1)) + 1;
        while ((lineToPaint & lineUnbroken) != lineToPaint) {
          lineToPaint = lineToPaint << 1;
        }
      }
      return {
        paint: lineToPaint,
        break: lineToBreak
      };
    },

    modifyLine(cubeLine, input) {
      cubeLine.forEach(function(cube, i) {
        cube.painted = cube.painted | ((input.paint & (1 << (cubeLine.length - i - 1))) != 0);
        cube.broken = cube.broken | ((input.break & (1 << (cubeLine.length - i - 1))) != 0);
      }, this);
    },
    
    /* Bitwise functions */

    ones(x) {
      return 2 ** x - 1;
    },

    countMaxConsecutiveOnes(x) {
      let count = 0;
      while (x != 0) {
        x = (x & (x << 1));
        count++;
      }
      return count;
    },

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

    splitSums(x) {
      let arr = [];
      for (let i = 1; i < x; i++) {
        arr.push([i, x - i]);
      }
      return arr;
    },

    findDoubles(x) {
      let left = x -1;
      let right = 1;
      let arr = []
      while (left > 0) {
        arr.push([left, right])
        left--;
        right++;
      }
      return arr;
    },

    findValidCompositions(clueCount, clueGroups, lineWidth) {
      let compsFound = [];
      this.findCompositions(compsFound, clueCount, clueGroups);
      return compsFound.filter(comp => (clueCount + comp.length - 1) <= lineWidth);
    },

    findCompositions(compsFound, clueCount, clueGroups) {
      if (clueGroups > 2) {
        let comp = [];
        for (let i = 0; i < clueCount; i++) {
          comp.push(1);
        }
        compsFound.push(comp);
        this.findSets(compsFound, comp.slice(0), 0);
      } else {
        for (let i = 1; i < clueCount; i++) {
          compsFound.push([i, clueCount - i]);
        }
      }
    },

    findSets(setsFound, set, start) {
      if (set.length <= 3 || (set.pop() != 1 )) {
        return;
      }
      for (let i = start; i < set.length; i++) {
        set[i] += 1;
        setsFound.push(set.slice(0));
        this.findSets(setsFound, set.slice(0), i)
        set[i] -= 1;
      }
    },

    countOnes(x) {
      let c = 0;
      for (c = 0; x; c++) {
        x &= x - 1;
      }
      return c;
    },
    reverseNBits(x, n) {
      let r = x & 1;
      while ((--n)) { 
        x >>= 1;  
        r <<= 1;
        r |= x & 1;
      }
      return r;
    },

    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min; 
    },

  }
}
</script>

<style lang="scss">

html,
body {
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: hsl(0, 0, 25%);
  display: grid;
  grid-gap: 0;
  margin: 0;
  grid-template: 
    "header header header header" 2em
    ". main main ." 4fr
    ". left right ." 1fr
    "footer footer footer footer" 2em
    / 0.5fr 2fr 2fr 0.5fr; 
  align-items: center;
  justify-items: center;
  justify-content: center;
  height: 100%;
}

#nona-canvas {
  margin: 0;
  max-width: 90%;
  height: 95%;
  grid-area: main;
  overflow: hidden;
  svg {
    overflow: visible;
  }
}

/*.list-enter-active, .list-leave-active {
  // transition: all 0.25s;
}*/
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(10px);
}

@mixin track() {
  width: 90%;
  background: transparent;
  border: none;
}

@mixin thumb($image) {
  width: 5em;
  height: 3em;
  border: none;
  background: transparent url($image) no-repeat;
}

.slider {
  align-self: start;
  height: 100%;
  width: 25vw;
  min-width: 10em;
  margin-top: -15vh;
  input {
    -webkit-appearance: none;
    background: none;
    background-size: 50% 50%;
    width: 100%;
    &::-webkit-slider-runnable-track { @include track }
    &::-moz-range-track { @include track }
    &::-ms-track { @include track }
  }
}

.slider-left {
  grid-area: left;
  justify-self: start;
  margin-right: 5vw;
  input {
    float: left;
    transform-origin: right;
    transform: rotateZ(-30deg); 
    &::-webkit-slider-thumb { @include thumb("./assets/redcursor.svg") }
    &::-moz-range-thumb { @include thumb("./assets/redcursor.svg") }
    &::-ms-thumb { @include thumb("./assets/redcursor.svg") }
  }
}

.slider-right {
  grid-area: right;
  justify-self: end;
  margin-left: 5vw;
  input {
    float: right;
    transform-origin: left;
    transform: rotateZ(30deg);
    &::-webkit-slider-thumb { @include thumb("./assets/greencursor.svg") }
    &::-moz-range-thumb { @include thumb("./assets/greencursor.svg") }
    &::-ms-thumb { @include thumb("./assets/greencursor.svg") }
  }
}

.info {
  grid-area: header;
  color: white;
  align-self: start;
  justify-self: start;
  p {
    margin: 0.2em;
  }
}

</style>
