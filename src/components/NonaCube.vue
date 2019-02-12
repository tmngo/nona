<template>            
  <svg class="list-item" width="16" height="16" 
      viewBox="32 32 16 16"
      :x="xPos" 
      :y="yPos" 
      @mousedown.left="$emit('painton', cube.i, cube.j, cube.k, $event)" 
      @mouseenter.left="$emit('paint', cube.i, cube.j, cube.k)"
      @mousedown.right.exact.prevent="$emit('breakon', $event)"
      @mouseup.right.exact.prevent="$emit('break', $event)">
      
    <polygon class="face" :style="stylesT" points="32,32 57.98,17 32,2 6.02,17"/>
    <polygon class="face" :style="stylesL" points="32,32 6.02,17 6.02,47 32,62"/>
    <polygon class="face" :style="stylesR" points="32,32 32,62 57.98,47 57.98,17"/>

    <text class="clue clue-left" x="19" y="33">{{ clues.l.count }}</text>
    <text class="clue clue-right" x="45.1" y="71">{{ clues.r.count }}</text>
    <text class="clue clue-top" x="1.5" y="39.5">{{ clues.t.count }}</text>
    <ellipse v-show="clues.t.groups == 2" class="clue-shape" cx="32" cy="17" rx="14" ry="7"/>
    <ellipse v-show="clues.l.groups == 2" class="clue-shape" cx="44" cy="3" rx="14" ry="7" style="transform: rotate(60deg)"/>
    <ellipse v-show="clues.r.groups == 2" class="clue-shape" cx="12" cy="-59" rx="14" ry="7" style="transform: rotate(120deg)"/>
    <polygon v-show="clues.t.groups > 2" class="clue-shape" points="32,27 49.32,17 32,7 14.68,17"/>
    <polygon v-show="clues.l.groups > 2" class="clue-shape" points="27.7,34.5 10.38,24.5 10.38,44.5 27.7,54.5"/>
    <polygon v-show="clues.r.groups > 2" class="clue-shape" points="36.3,34.5 36.3,54.5 53.62,44.5 53.62,24.5"/>

    <polygon :class="['cube-outline', {'cube-hider': !active}]" points="6.02,17 6.02,47 32,62 57.98,47 57.98,17 32,2"/>
      
  </svg>
</template>

<script>
export default {
  name: 'NonaCube',
  props: {
    x: Number, 
    y: Number, 
    cube: Object,
    clueGrids: Object,
    active: Boolean,
  },
  computed: {
    n() {
      return this.clueGrids.t.length;
    },
    xPos() {
      return -25.98 * this.cube.i + 25.98 * this.cube.j;
    },
    yPos() {
      return 15 * this.cube.i + 15 * this.cube.j - 30 * this.cube.k;
    },

    clues() {
      return {
        t: this.clueGrids.t[this.cube.j][this.cube.i],
        l: this.clueGrids.l[this.cube.k][this.cube.j],
        r: this.clueGrids.r[this.cube.k][this.cube.i],
      }
    },
    stylesT() {
      return {
        fill: (this.cube.painted) ? "hsl(180, 50%, 80%)" : "hsl(45, 20%, 96%)",
      }
    },
    stylesL() {
      return {
        fill: (this.cube.painted) ? "hsl(180, 50%, 70%)" : "hsl(45, 20%, 80%)",
      }
    },
    stylesR() {
      return {
        fill: (this.cube.painted) ? "hsl(180, 30%, 50%)" : "hsl(45, 20%, 64%)",
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
/*.face {
  // transition: fill 0.2s;
}*/
.cube-outline {
  stroke: black;
  stroke-width: 1px;
  fill: transparent;
  // transition: fill 0.1s;
}
.cube-outline:hover {
  fill: hsla(45, 40%, 50%, 0.4);
}
.painted {
  fill: hsla(180, 100%, 85%, 0.4);
}

.clue {
  font-size: 0.8em;
  font-weight: 1000;
  text-anchor: middle;
  opacity: 0.7;
  user-select: none;
}
.clue-top {
  transform: rotate3d(0, 0, 1, -60deg) skew(0deg, 30deg);
}
.clue-left {
  transform: skew(0deg, 30deg);
}
.clue-right {
  transform: skew(0deg, -30deg);
}
.clue-shape {
  stroke: black;
  stroke-width: 2px;
  opacity: 0.7;
  fill: none;
}
.cube-hider {
  fill: hsla(45, 56%, 20%, 0.4);
}

</style>
