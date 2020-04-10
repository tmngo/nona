<template>
  <canvas 
    id="canvas"
    width="800"
    height="800"
    @mousedown="handleMouseDown"
    @contextmenu.prevent
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="dragging = false"
  ></canvas>
</template>

<script>
export default {
  name: 'NonaCanvas',
  props: {
    n: Number,
    cubes: Array,
    cubeVisibility: Array,
    cubeHighlight: Array,
    clueGrids: Object,
    sectionX: Number,
    sectionY: Number,
    controls: Object,
    loading: Boolean,
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      valid: false,
      shapes: [],
      dragging: false,
      selection: null,
      dragOffX: 0,
      dragOffY: 0,
      xPos: 0,
      yPos: 0,

      selectedCube: null,
      selectedIndex: 0,
      drawIndex: 0,
      style: {
        paddingLeft: 0,
        paddingTop: 0,
        borderLeft: 0,
        borderTop: 0,
        htmlLeft: 0,
        htmlTop: 0
      }
    }
  },
  watch: {
    cubes: {
      handler: function () { this.drawCubes(this.drawIndex) },
      deep: true,
    },
    cubeVisibility() {
      this.drawCubes(0);
    },
    n() {
      this.xPos = (this.canvas.width / 2) / this.size - 8.66;
      this.yPos = (this.canvas.height / 2) / this.size - 10;
        this.drawCubes(0);
    }
  },
  computed: {
    size() {
      return 32 / this.n;
    },
    puzzleWidth() {
      return 2 * this.n * 8.66;
    },
    canvasScale() {
      return (this.canvas.width / this.canvas.clientWidth).toFixed(2);
    },
    visibleCubes() {
      return this.cubes.filter((c, i) => this.cubeVisibility[i]);
    },
    visibleHighlit() {
      let arr = [];
      for (let i = 0; i < this.visibleCubes.length; ++i) {
        let cube = this.visibleCubes[i];
        arr[i] = (cube.j == this.sectionY-1 && this.sectionX == 1) 
          || (cube.i == -(this.sectionX-this.n-1) && this.sectionY == this.n+1) 
          || (this.sectionY==this.n+1 && this.sectionX==1);
      }
      return arr;
    },
    visibleClues() {
      return this.visibleCubes.map(cube => ({
        t: this.clueGrids.t[cube.j][cube.i],
        l: this.clueGrids.l[cube.k][cube.j],
        r: this.clueGrids.r[cube.k][cube.i]
      }))
    },
    cubePositions() {
      let arr = [];
      for (let i = 0; i < this.visibleCubes.length; i++) {
        arr[i] = this.getTotalCubePos(this.visibleCubes[i]);
      }
      return arr;
    }
  },
  mounted() {
   this.init();
  },
  methods: {
    
    init() {
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.font = "700 0.35em Fira Sans";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.xPos = (this.canvas.width / 2) / this.size - 8.66;
      this.yPos = (this.canvas.height / 2) / this.size - 10;
      this.style.paddingLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingLeft'], 10);
      this.style.paddingTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingTop'], 10);
      this.style.borderLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderLeftWidth'], 10);
      this.style.borderTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderTopWidth'], 10);
      this.style.htmlLeft = document.body.parentNode.offsetLeft;
      this.style.htmlTop = document.body.parentNode.offsetTop;
      this.drawCubes(0, this.size);
    },

    handleMouseDown(evt) {
      this.dragging = true;
      let mousePos = this.getRelativeMousePos(evt);
      let mx = mousePos.x * this.canvasScale;
      let my = mousePos.y * this.canvasScale;
      for (let i = this.visibleCubes.length-1; i >= 0; i--) {
        let cube = this.visibleCubes[i];
        if (this.cubeContains(cube, mx, my)) {
          this.drawIndex = i;
          if (evt.button === this.controls.paint) {
            this.$emit('painton', cube.i, cube.j, cube.k, this.$event)
          return;
          } else if (evt.button === this.controls.break) {
            this.$emit('breakon', cube.id, this.$event);
          }
        }
      }
    },

    handleMouseUp(evt) {
      if (evt.button !== this.controls.break) {
        return;
      }
      this.dragging = false;
      let mousePos = this.getRelativeMousePos(evt);
      let mx = mousePos.x * this.canvasScale;
      let my = mousePos.y * this.canvasScale;
      for (let i = this.visibleCubes.length-1; i >= 0; i--) {
        let cube = this.visibleCubes[i];
        if (this.cubeContains(cube, mx, my)) {
          this.drawIndex = i;
          this.$emit('break', cube)
          return;
        }
      }
    },

    handleMouseMove(evt) {
      if (this.selectedCube) {
        this.selectedCube.selected = false;
        this.selectedCube = null;
      }
      let mousePos = this.getRelativeMousePos(evt);
      let mx = mousePos.x * this.canvasScale;
      let my = mousePos.y * this.canvasScale;
      for (let i = this.visibleCubes.length-1; i >= 0; i--) {
        let cube = this.visibleCubes[i];
        if (this.cubeContains(cube, mx, my)) {
          this.selectCube(cube, i);
          if (this.dragging) {
            this.$emit('paint', cube.i, cube.j, cube.k)
          }
          return;
        }
      }
    },

    selectCube(cube, i) {
      this.drawIndex = this.selectedIndex;
      this.selectedCube = cube;
      this.selectedIndex = i;
      this.drawSelectedClue(this.ctx, 36*this.n/8, 15*this.n/8, this.n/8);
      this.selectedCube.selected = true;
    },

    getRelativeMousePos(evt) {
      let element = this.canvas;
      let offsetX = 0;
      let offsetY = 0;

      if (element.offsetParent !== undefined) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent))
      }
      offsetX += this.style.paddingLeft + this.style.borderLeft + this.style.htmlLeft;
      offsetY += this.style.paddingTop + this.style.borderTop + this.style.htmlTop;

      let mx = evt.pageX - offsetX;
      let my = evt.pageY - offsetY;

      return {x: mx, y: my};
    },

    cubeContains(cube, mx, my) {
      let s = this.size;
      let pos = this.getTotalCubePos(cube);
      let offsetX = s * pos.x;
      let offsetY = s * pos.y;
      return (mx >= offsetX) 
          && (mx <= 17.32*s + offsetX)
          && (my >= 5*s - 5/8.66 * (mx - offsetX) + offsetY)
          && (my >= -5*s + 5/8.66 * (mx - offsetX) + offsetY)
          && (my <= 15*s + 5/8.66 * (mx - offsetX) + offsetY)
          && (my <= 25*s - 5/8.66 * (mx - offsetX) + offsetY);
    },

    drawSelectedClue(ctx, x, y, scale = 0.5) {
      let s = scale;
      this.drawCubeOutline(ctx, x, y, s, '#000', 0.6);
      ctx.fillStyle = '#444'
      ctx.fill()

      ctx.lineWidth = 0.2*s;
      ctx.beginPath();
      ctx.moveTo(x, y + 5*s);
      ctx.lineTo(x + 8.66*s, y + 10*s);
      ctx.lineTo(x + 17.32*s, y + 5*s);
      ctx.moveTo(x + 8.66*s, y + 10*s);
      ctx.lineTo(x + 8.66*s, y + 20*s);
      ctx.stroke();

      ctx.save()
      this.ctx.setTransform(1,0,0,1,0,0)
      this.drawClue(this.ctx, x/scale, y/scale, this.visibleClues[this.selectedIndex], scale * this.size)
      ctx.restore()
    },

    drawCubes(start = 0, scale = 1) {
      if (this.loading) {
        return;
      }
      this.ctx.scale(scale, scale);
      if (start === 0) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      for (let i = start; i < this.visibleCubes.length; i++) {
        let x = this.cubePositions[i].x;
        let y = this.cubePositions[i].y;
        
        this.drawCube(this.ctx, x, y, this.visibleCubes[i], this.visibleHighlit[i]);
        this.ctx.setTransform(1,0,0,1,0,0);
        this.drawClue(this.ctx, x, y, this.visibleClues[i], this.size);
      }
    },

    drawCube(ctx, x, y, cube, highlit) {
      
      let topColor = "hsl(45, 20%, 96%)";
      let leftColor = "hsl(45, 20%, 80%)";
      let rightColor = "hsl(45, 20%, 64%)";

      if (cube.strike) {
        topColor = "hsl(0, 50%, 80%)";
        leftColor = "hsl(0, 50%, 70%)";
        rightColor = "hsl(0, 30%, 50%)";
      } else if (cube.painted) {
        topColor = "hsl(180, 50%, 80%)";
        leftColor = "hsl(180, 50%, 70%)";
        rightColor = "hsl(180, 30%, 50%)";
      }

      this.fillTopFace(ctx, x, y, topColor);
      this.fillLeftFace(ctx, x, y, leftColor);
      this.fillRightFace(ctx, x, y, rightColor);
      this.drawCubeOutline(ctx, x, y, 1, '#000', 0.75);

      if (!highlit) {
        ctx.fillStyle = "hsla(45, 46%, 10%, 0.6)"
        ctx.fill();
      }
      if (cube.selected) {
        ctx.fillStyle = "hsla(45, 40%, 50%, 0.4)"
        ctx.fill();
      }
    },

    fillTopFace(ctx, x, y, fill) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(x + 8.66, y);
      ctx.lineTo(x, y + 5);
      ctx.lineTo(x + 8.66, y + 10);
      ctx.lineTo(x + 17.32, y + 5);
      ctx.closePath()
      ctx.fill();
    },

    fillLeftFace(ctx, x, y, fill) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x, y + 15);
      ctx.lineTo(x + 8.66, y + 20);
      ctx.lineTo(x + 8.66, y + 10);
      ctx.closePath()
      ctx.fill();
    },

    fillRightFace(ctx, x, y, fill) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(x + 8.66, y + 10);
      ctx.lineTo(x + 8.66, y + 20);
      ctx.lineTo(x + 17.32, y + 15);
      ctx.lineTo(x + 17.32, y + 5);
      ctx.closePath()
      ctx.fill();
    },

    drawCubeOutline(ctx, x, y, s, stroke, width) {
      ctx.lineWidth = width*s;
      ctx.beginPath();
      ctx.moveTo(x + 8.66*s, y);
      ctx.lineTo(x, y + 5*s);
      ctx.lineTo(x, y + 15*s);
      ctx.lineTo(x + 8.66*s, y + 20*s);
      ctx.lineTo(x + 17.32*s, y + 15*s);
      ctx.lineTo(x + 17.32*s, y + 5*s);
      ctx.closePath();
      ctx.stroke();
    },

    drawClue(ctx, x, y, clue, scale) {
      ctx.transform(scale, 0, 0, scale, 0, 0)
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
      ctx.strokeStyle = "rgba(0, 0, 0, 0.9)"
      ctx.lineWidth = 0.5;
      
      let r = 3.4;
      if (clue.t.isVisible) {
        ctx.save()
        ctx.transform(1, 0, 0, 1, x + 8.66, y + 5);
        ctx.rotate(-Math.PI / 3);
        ctx.transform(0.866, 0.57735, 0, 1, 0, 0);
        ctx.fillText(clue.t.count, 0, 0);
        if (clue.t.groups === 2) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2*Math.PI);
          ctx.stroke();
        }
        else if (clue.t.groups > 2) {
          ctx.beginPath();
          ctx.moveTo(-r, -r+.25);
          ctx.lineTo(r, -r-.25);
          ctx.lineTo(r, r-.25);
          ctx.lineTo(-r, r+.25);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore()
      }

      if (clue.l.isVisible) {
        ctx.save();
        ctx.transform(.866, .57735, 0, 1, x+4.33, y + 12.5);
        ctx.fillText(clue.l.count, 0, 0);
        if (clue.l.groups === 2) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2*Math.PI);
          ctx.stroke();
        }
        else if (clue.l.groups > 2) {
          ctx.beginPath();
          ctx.moveTo(-r, -r+.25);
          ctx.lineTo(r, -r-.25);
          ctx.lineTo(r, r-.25);
          ctx.lineTo(-r, r+.25);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore()
      }
      
      if (clue.r.isVisible) {
        ctx.save();
        ctx.transform(.866, -.57735, 0, 1, x + 12.99, y + 12.5);
        ctx.fillText(clue.r.count, 0, 0);
        if (clue.r.groups === 2) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, 2*Math.PI);
          ctx.stroke();
        }
        else if (clue.r.groups > 2) {
          ctx.beginPath();
          ctx.moveTo(-r, -r-.25);
          ctx.lineTo(r, -r+.25);
          ctx.lineTo(r, r+.25);
          ctx.lineTo(-r, r-.25);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore()
      }
    },

    getTotalCubePos(cube) {
      return {
        x: (this.xPos + -8.66 * cube.i + 8.66 * cube.j),
        y: (this.yPos + 5 * cube.i + 5 * cube.j - 10 * cube.k)
      }
    },

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
