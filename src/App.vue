<template>
  <div id="app" @mouseup="disablePaint" @mousedown.right.prevent>
      
    <a id="home" href="https://timmngo.github.io">timmngo.github.io</a>

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
      :loading="loading"
      @painton="enablePaint"
      @paint="paintCube"
      @breakon="enableBreak"
      @break="breakCube"
    ></NonaCanvas>

    <svg 
      v-show="loading" 
      id="loading" 
      viewBox="-38 -38 76 76"
      width="800"
    >
      <polygon 
        points="0,-30 25.98,-15 25.98,15 0,30 -25.98,15 -25.98,-15 0,-30  2.598,-28.5"
        :stroke-dasharray="`${90*progress} ${90*(1-progress)}`"
      />
    </svg>
    

    <div class="slider slider-left">
      <input type="range" 
        v-model.number="sectionX" 
        @mousedown="resetSectionView()"
        :style="{opacity: (sectionY != n+1) ? 0.4 : 1}" 
        min="1" :max="n+1"/>
    </div>

    <div class="slider slider-right">
      <input 
        type="range" 
        v-model.number="sectionY" 
        @mousedown="resetSectionView()"
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
      <button class="menu-btn" @click="clearSelection();showMenu = !showMenu">Menu</button>

      <div v-show="showMenu" class="submenu">
        <div class="button-strip">
          <button 
            :style="{ color: type === 'uniform' ? '#fff' : '#404040'}" 
            @click="type = 'uniform'"
          >Uniform</button>
          <button 
            :style="{ color: type === 'metaball' ? '#fff' : '#404040'}" 
            @click="type = 'metaball'"
          >Metaball</button>
        </div>
        <hr style="width: 70%; margin: 0em auto 1em auto"/>
        <label for="n">N = {{ newN }}</label>
        <input name="n" type="range" min="2" max="8" v-model.number="newN"/>

        <label>Density = {{ newDensity }}</label>
        <input type="range" min="0.1" max="0.9" step="0.1" v-model.number="newDensity"/>

        <label>Clue removal = {{ newRemoval }}</label>
        <input type="range" min="0" max="1" step="0.1" v-model.number="newRemoval"/>

        <label v-show="type === 'metaball'">Metaballs = {{ newOptions.metaballs }}</label>
        <input 
          v-show="type === 'metaball'" 
          type="range" min="1" max="20" 
          v-model.number="newOptions.metaballs"
        />

        <label v-show="type === 'metaball'">Noise = {{ newOptions.noise }}</label>
        <input 
          v-show="type === 'metaball'" 
          type="range" min="0" 
          max="1" step="0.1" 
          v-model.number="newOptions.noise"
        />

        <button 
          @click="generatePuzzleInWorker(newN, newDensity, newRemoval, type, newOptions)"
        >Generate puzzle</button>  
        <button @click="resetPuzzle">Reset puzzle</button>
      </div>

      <div v-show="showMenu" class="submenu">
        <p>Status = {{ this.n**3 - numSolid - numBroken === 0 ? 'solved' : 'unsolved' }}</p>
        <p>Remaining = {{ this.n**3 - numSolid - numBroken }}</p>
        <p>Strikes = {{ strikes }}</p>
      </div>

      <div v-show="showMenu" class="submenu">
        <button @click="solveIterationInWorker">Solve iteration</button>
        <button @click="solveInWorker">Solve complete</button>
      </div>

      <div v-show="showMenu" class="submenu">
        <a class="link" href="https://github.com/timmngo/nona">Help</a>
      </div>

    </div>

  </div>
</template>

<script>
import NonaCanvas from './components/NonaCanvas.vue'
import myWorker from './assets/worker';

export default {
  name: 'app',
  components: {
    NonaCanvas,
  },
  data() {
    return {
      grid: [],
      clueGrids: {
        l: [],
        r: [],
        t: [],
      },
      sections: [],
      newN: 5,
      newDensity: 0.4,
      newRemoval: 1,
      newOptions: {
        metaballs: 12,
        noise: 0.9,
      },
      n: 5,
      loading: false,
      paintEnabled: false,
      breakableId: "",
      paintType: true,
      progress: 0,
      sectionX: 1,
      sectionY: 6,
      strikes: 0,
      showMenu: false,
      type: 'uniform',
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
    clueArr() {
      return this.clueGrids.l.concat(this.clueGrids.r, this.clueGrids.t).flat();
    },
    solved() {
      return (this.n**3 - this.numSolid - this.numBroken) === 0 && (this.numPainted === this.numSolid);
    }
  },
  created() {
    this.generatePuzzleInWorker(5, 0.4, 1, "uniform", this.newOptions)
  },
  mounted() {
  },
  methods: {

/* eslint-disable */
    
    /*********************/
    /* Puzzle generation */ 
    /*********************/

    generatePuzzleInWorker(size, density, removal, type, options) {
      this.strikes = 0;

      myWorker.send({
        command: "generate",
        size: size,
        density: density,
        removal: removal,
        type: type,
        options: options,
      }).then(reply => {
          this.n = size;
          this.grid = reply.grid;
          this.clueGrids = reply.clueGrids;
          this.resetPuzzle()
          this.resetSectionView();
        })
    },

    generateSolvedInWorker(size, density, removal, type, options) {
      this.strikes = 0;

      myWorker.send({
        command: "generate",
        size: size,
        density: density,
        removal: removal,
        type: type,
        options: options,
      }).then(reply => {
          this.n = size;
          this.grid = reply.grid;
          this.clueGrids = reply.clueGrids;
          this.resetSectionView();
        })
    },

    solveInWorker() {
      myWorker.send({
        command: "solve",
        grid: this.grid,
        clueGrids: this.clueGrids,
      }).then(reply => {
          this.grid = reply.grid;
          this.clueGrids = reply.clueGrids;
        })
    },

    solveIterationInWorker() {
      myWorker.send({
        command: "solve-iteration",
        grid: this.grid,
        clueGrids: this.clueGrids,
      }).then(reply => {
          this.grid = reply.grid;
          this.clueGrids = reply.clueGrids;
        })
    },

    /* Resets puzzle to its unsolved state */
    resetPuzzle() {
      for (let i = 0; i < this.cubeArr.length; i++) {
        this.cubeArr[i].painted = false;
        this.cubeArr[i].broken = false;
      }
      for (let i = 0; i < 3*this.n*this.n; i++) {
        this.clueArr[i].isSolved = false;
      }
    },

    /******************/
    /* Input handling */
    /******************/

    clearSelection() {
      if (window.getSelection) {window.getSelection().removeAllRanges();}
      else if (document.selection) {document.selection.empty();}
    },

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

    breakCube(cube) {
      if (cube.id !== this.breakableId || cube.painted) {
        this.breakableId = "";
        return;
      }
      if (!cube.solid) {
        cube.broken = true;
      } else if (!cube.strike) {
        cube.strike = true;
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

    /* Returns a random integer uniformly between min (inclusive) and max (exclusive) */
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min; 
    },

    computeDistanceSquared(a, b) {
      return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);
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
@import "./assets/style/fonts.scss";

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
    family: $font-stack !important;
    size: 1rem;
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
  color: #fff;

  font: {
    size: 0.75em;
    weight: bold;
  }
  grid-area: header;
  height: 1.5em;
  line-height: 1.5em;
  justify-self: start;
  margin: 1.25em;
  text-decoration: none;
  width: 3em;
  border-radius: 2px;
  z-index: 1;
  &:focus, &:hover {
    color: white;
    text-decoration: underline;
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
    fill: hsla(45, 20%, 80%, 0.7); 
    height: 100%;
    stroke: #111; 
    stroke-width: 2; 
    // transition: all linear 0.005s;
    // transition-delay: 0.01s;
  }
}

@mixin button() {
  font: {
    family: $font-stack;
    weight: 600;
    size: 1em;
  }
  text: {
    align: left;
    decoration: none;
  }
  cursor: pointer;
  white-space: nowrap;
  height: 2em;
  padding: 0 14px;
  box-shadow: 0 4px 6px rgba(50,50,93,.11),0 1px 3px rgba(0,0,0,.08);
  background: #fff;
  border-radius: 3px;
  line-height: 2em;
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
  padding: 0.5em 0.5em;
  width: 90%;
  z-index: 10;
  button {
    @include button;
    margin: 0.2em;
  }
  a, p {
    margin: 0.2em;
  }
  label {
    font-size: 0.9em;
  }
  &:first-of-type {

  }
  &:last-child {
    border-bottom: solid #444 1px;
  }
}


.button-strip {
  display: flex;
  button {
    background: none;
    padding: 0;
    height: 2em;
    line-height: 2em;
    font-size: 1em;
    width: 100%;
    &:focus, &:hover {
      color: #fff;
      background: none;
    }
    &:active {
      background: none;
    }
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
  height: 0;
  border: none;
  width: 90%;
  // border: dashed #333 3px;
}

@mixin thumb($image) {
  -webkit-appearance: none;
  background: transparent url($image) no-repeat;
  background-position: center; 
  border: none;
  height: 5.5em;
  width: 5.5em;
}

.slider {
  align-self: start;
  height: 100%;
  input {
    -webkit-appearance: none;
    background: none;
    min-width: 13em;
    max-width: 20em;
    width: 25vw;
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
    &::-webkit-slider-thumb { @include thumb("./assets/svg/redcursor.svg") }
    &::-moz-range-thumb { @include thumb("./assets/svg/redcursor.svg") }
    &::-ms-thumb { @include thumb("./assets/svg/redcursor.svg") }
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
    &::-webkit-slider-thumb { @include thumb("./assets/svg/greencursor.svg") }
    &::-moz-range-thumb { @include thumb("./assets/svg/greencursor.svg") }
    &::-ms-thumb { @include thumb("./assets/svg/greencursor.svg") }
  }
}

</style>
