(function(e){function t(t){for(var i,r,a=t[0],l=t[1],u=t[2],h=0,d=[];h<a.length;h++)r=a[h],s[r]&&d.push(s[r][0]),s[r]=0;for(i in l)Object.prototype.hasOwnProperty.call(l,i)&&(e[i]=l[i]);c&&c(t);while(d.length)d.shift()();return o.push.apply(o,u||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],i=!0,a=1;a<n.length;a++){var l=n[a];0!==s[l]&&(i=!1)}i&&(o.splice(t--,1),e=r(r.s=n[0]))}return e}var i={},s={app:0},o=[];function r(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=i,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/nona/";var a=window["webpackJsonp"]=window["webpackJsonp"]||[],l=a.push.bind(a);a.push=t,a=a.slice();for(var u=0;u<a.length;u++)t(a[u]);var c=l;o.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"47bd":function(e,t,n){e.exports=function(){return new Worker(n.p+"9aacfad8cc766b2eae7f.worker.js")}},"56d7":function(e,t,n){"use strict";n.r(t);n("cadf"),n("551c"),n("f751"),n("097d");var i=n("2b0e"),s=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"},on:{mouseup:e.disablePaint,mousedown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"right",39,t.key,["Right","ArrowRight"])?null:"button"in t&&2!==t.button?null:void t.preventDefault()}}},[n("a",{attrs:{id:"home",href:"https://timmngo.github.io"}},[e._v("timmngo.github.io")]),n("NonaCanvas",{directives:[{name:"show",rawName:"v-show",value:!e.loading,expression:"!loading"}],attrs:{n:e.n,cubes:e.cubeArr,"cube-visibility":e.cubeVisibility,"cube-highlight":e.cubeHighlight,"clue-grids":e.clueGrids,"section-x":e.sectionX,"section-y":e.sectionY,controls:e.controls,loading:e.loading},on:{painton:e.enablePaint,paint:e.paintCube,breakon:e.enableBreak,break:e.breakCube}}),n("svg",{directives:[{name:"show",rawName:"v-show",value:e.loading,expression:"loading"}],attrs:{id:"loading",viewBox:"-38 -38 76 76",width:"800"}},[n("polygon",{attrs:{points:"0,-30 25.98,-15 25.98,15 0,30 -25.98,15 -25.98,-15 0,-30  2.598,-28.5","stroke-dasharray":90*e.progress+" "+90*(1-e.progress)}})]),n("div",{staticClass:"slider slider-left"},[n("input",{directives:[{name:"model",rawName:"v-model.number",value:e.sectionX,expression:"sectionX",modifiers:{number:!0}}],style:{opacity:e.sectionY!=e.n+1?.4:1},attrs:{type:"range",min:"1",max:e.n+1},domProps:{value:e.sectionX},on:{mousedown:function(t){return e.resetSectionView()},__r:function(t){e.sectionX=e._n(t.target.value)},blur:function(t){return e.$forceUpdate()}}})]),n("div",{staticClass:"slider slider-right"},[n("input",{directives:[{name:"model",rawName:"v-model.number",value:e.sectionY,expression:"sectionY",modifiers:{number:!0}}],style:{opacity:1!=e.sectionX?.4:1},attrs:{type:"range",min:"1",max:e.n+1},domProps:{value:e.sectionY},on:{mousedown:function(t){return e.resetSectionView()},__r:function(t){e.sectionY=e._n(t.target.value)},blur:function(t){return e.$forceUpdate()}}})]),n("div",{staticClass:"controls"},[n("svg",{attrs:{viewBox:"-48 -48 96 96"},on:{click:e.swapControls}},[n("rect",{attrs:{x:"-16",y:"-48",width:"64",height:"64",stroke:"black","stroke-width":"2",fill:"hsl(45, 20%, 96%)"}}),n("line",{attrs:{x1:"-16",y1:"16",x2:"48",y2:"-48"}}),n("line",{attrs:{x1:"-16",y1:"-48",x2:"48",y2:"16"}}),n("transition",{attrs:{name:"fade"}},[n("rect",{directives:[{name:"show",rawName:"v-show",value:2===e.controls.paint,expression:"controls.paint === 2"}],attrs:{x:"-15",y:"-47",width:"62",height:"62",stroke:"hsl(45, 20%, 96%)","stroke-width":"2",fill:"hsl(180, 50%, 50%)"}})]),n("rect",{attrs:{x:"-16",y:"-48",width:"64",height:"64",stroke:"black","stroke-width":"1",fill:"none"}}),n("rect",{attrs:{x:"-48",y:"-16",width:"64",height:"64",stroke:"black","stroke-width":"2",fill:"hsl(45, 20%, 96%)"}}),n("line",{attrs:{x1:"-48",y1:"48",x2:"16",y2:"-16"}}),n("line",{attrs:{x1:"-48",y1:"-16",x2:"16",y2:"48"}}),n("transition",{attrs:{name:"fade"}},[n("rect",{directives:[{name:"show",rawName:"v-show",value:0===e.controls.paint,expression:"controls.paint === 0"}],attrs:{x:"-47",y:"-15",width:"62",height:"62",stroke:"hsl(45, 20%, 96%)","stroke-width":"2",fill:"hsl(180, 50%, 50%)"}})]),n("rect",{attrs:{x:"-48",y:"-16",width:"64",height:"64",stroke:"black","stroke-width":"1",fill:"none"}}),n("text",{attrs:{x:"50",y:"15",fill:"hsl(45, 20%, 96%)"}},[e._v("R")]),n("text",{attrs:{x:"18",y:"47",fill:"hsl(45, 20%, 96%)"}},[e._v("L")])],1)]),n("div",{staticClass:"menu",style:{background:e.showMenu?"#262626f2":"none"}},[n("button",{staticClass:"menu-btn",on:{click:function(t){e.clearSelection(),e.showMenu=!e.showMenu}}},[e._v(e._s(e.showMenu?"╳":"☰"))]),n("div",{directives:[{name:"show",rawName:"v-show",value:e.showMenu,expression:"showMenu"}],staticClass:"submenu"},[n("div",{staticClass:"button-strip"},[n("button",{staticStyle:{"border-radius":"4px 0 0 4px","margin-right":"0"},style:{color:"uniform"===e.type?"#000":"#f7f6f3",background:"uniform"===e.type?"#f7f6f3":"none"},on:{click:function(t){e.type="uniform"}}},[e._v("Uniform")]),n("button",{staticStyle:{"border-radius":"0 4px 4px 0","margin-left":"0"},style:{color:"metaball"===e.type?"#000":"#f7f6f3",background:"metaball"===e.type?"#f7f6f3":"none"},on:{click:function(t){e.type="metaball"}}},[e._v("Metaball")])])]),n("div",{directives:[{name:"show",rawName:"v-show",value:e.showMenu,expression:"showMenu"}],staticClass:"submenu"},[n("label",{attrs:{for:"n"}},[e._v("N = "+e._s(e.newN))]),n("input",{directives:[{name:"model",rawName:"v-model.number",value:e.newN,expression:"newN",modifiers:{number:!0}}],staticClass:"range-input",attrs:{name:"n",type:"range",min:"2",max:"8"},domProps:{value:e.newN},on:{__r:function(t){e.newN=e._n(t.target.value)},blur:function(t){return e.$forceUpdate()}}}),n("label",[e._v("Density = "+e._s(e.newDensity))]),n("input",{directives:[{name:"model",rawName:"v-model.number",value:e.newDensity,expression:"newDensity",modifiers:{number:!0}}],staticClass:"range-input",attrs:{type:"range",min:"0.1",max:"0.9",step:"0.1"},domProps:{value:e.newDensity},on:{__r:function(t){e.newDensity=e._n(t.target.value)},blur:function(t){return e.$forceUpdate()}}}),n("label",[e._v("Clue removal = "+e._s(e.newRemoval))]),n("input",{directives:[{name:"model",rawName:"v-model.number",value:e.newRemoval,expression:"newRemoval",modifiers:{number:!0}}],staticClass:"range-input",attrs:{type:"range",min:"0",max:"1",step:"0.1"},domProps:{value:e.newRemoval},on:{__r:function(t){e.newRemoval=e._n(t.target.value)},blur:function(t){return e.$forceUpdate()}}}),n("label",{directives:[{name:"show",rawName:"v-show",value:"metaball"===e.type,expression:"type === 'metaball'"}]},[e._v("Metaballs = "+e._s(e.newOptions.metaballs))]),n("input",{directives:[{name:"show",rawName:"v-show",value:"metaball"===e.type,expression:"type === 'metaball'"},{name:"model",rawName:"v-model.number",value:e.newOptions.metaballs,expression:"newOptions.metaballs",modifiers:{number:!0}}],staticClass:"range-input",attrs:{type:"range",min:"1",max:"20"},domProps:{value:e.newOptions.metaballs},on:{__r:function(t){e.$set(e.newOptions,"metaballs",e._n(t.target.value))},blur:function(t){return e.$forceUpdate()}}}),n("label",{directives:[{name:"show",rawName:"v-show",value:"metaball"===e.type,expression:"type === 'metaball'"}]},[e._v("Noise = "+e._s(e.newOptions.noise))]),n("input",{directives:[{name:"show",rawName:"v-show",value:"metaball"===e.type,expression:"type === 'metaball'"},{name:"model",rawName:"v-model.number",value:e.newOptions.noise,expression:"newOptions.noise",modifiers:{number:!0}}],staticClass:"range-input",attrs:{type:"range",min:"0",max:"1",step:"0.1"},domProps:{value:e.newOptions.noise},on:{__r:function(t){e.$set(e.newOptions,"noise",e._n(t.target.value))},blur:function(t){return e.$forceUpdate()}}}),n("button",{on:{click:function(t){return e.generatePuzzleInWorker(e.newN,e.newDensity,e.newRemoval,e.type,e.newOptions)}}},[e._v("Generate puzzle")]),n("button",{on:{click:e.resetPuzzle}},[e._v("Reset puzzle")])]),n("div",{directives:[{name:"show",rawName:"v-show",value:e.showMenu,expression:"showMenu"}],staticClass:"submenu",staticStyle:{"white-space":"pre"}},[n("p",[e._v(e._s("Status:\t\t\t")+e._s(Math.pow(this.n,3)-e.numSolid-e.numBroken===0?"solved":"unsolved"))]),n("p",[e._v(e._s("Remaining:\t\t")+e._s(Math.pow(this.n,3)-e.numSolid-e.numBroken))]),n("p",[e._v(e._s("Strikes:\t\t\t")+e._s(e.strikes))])]),n("div",{directives:[{name:"show",rawName:"v-show",value:e.showMenu,expression:"showMenu"}],staticClass:"submenu"},[n("button",{on:{click:e.solveIterationInWorker}},[e._v("Solve iteration")]),n("button",{on:{click:e.solveInWorker}},[e._v("Solve complete")])]),n("div",{directives:[{name:"show",rawName:"v-show",value:e.showMenu,expression:"showMenu"}],staticClass:"submenu"},[n("a",{staticClass:"link",attrs:{href:"https://github.com/timmngo/nona"}},[e._v("How to play")])])])],1)},o=[],r=(n("6b54"),n("1448"),function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("canvas",{attrs:{id:"canvas",width:"800",height:"800"},on:{mousedown:e.handleMouseDown,contextmenu:function(e){e.preventDefault()},mousemove:e.handleMouseMove,mouseup:e.handleMouseUp,mouseleave:function(t){e.dragging=!1}}})}),a=[],l=(n("6c7b"),n("e814")),u=n.n(l),c=(n("c5f6"),{name:"NonaCanvas",props:{n:Number,cubes:Array,cubeVisibility:Array,cubeHighlight:Array,clueGrids:Object,sectionX:Number,sectionY:Number,controls:Object,loading:Boolean},data:function(){return{canvas:null,ctx:null,valid:!1,shapes:[],dragging:!1,selection:null,dragOffX:0,dragOffY:0,xPos:0,yPos:0,selectedCube:null,selectedIndex:0,drawIndex:0,style:{paddingLeft:0,paddingTop:0,borderLeft:0,borderTop:0,htmlLeft:0,htmlTop:0}}},watch:{cubes:{handler:function(){this.drawCubes(this.drawIndex)},deep:!0},cubeVisibility:function(){this.drawCubes(0)},n:function(){this.xPos=this.canvas.width/2/this.size-8.66,this.yPos=this.canvas.height/2/this.size-10,this.drawCubes(0)}},computed:{size:function(){return 32/this.n},puzzleWidth:function(){return 2*this.n*8.66},canvasScale:function(){return(this.canvas.width/this.canvas.clientWidth).toFixed(2)},visibleCubes:function(){var e=this;return this.cubes.filter(function(t,n){return e.cubeVisibility[n]})},visibleHighlit:function(){for(var e=[],t=0;t<this.visibleCubes.length;++t){var n=this.visibleCubes[t];e[t]=n.j==this.sectionY-1&&1==this.sectionX||n.i==-(this.sectionX-this.n-1)&&this.sectionY==this.n+1||this.sectionY==this.n+1&&1==this.sectionX}return e},visibleClues:function(){var e=this;return this.visibleCubes.map(function(t){return{t:e.clueGrids.t[t.j][t.i],l:e.clueGrids.l[t.k][t.j],r:e.clueGrids.r[t.k][t.i]}})},cubePositions:function(){for(var e=[],t=0;t<this.visibleCubes.length;t++)e[t]=this.getTotalCubePos(this.visibleCubes[t]);return e}},mounted:function(){this.init()},methods:{init:function(){this.canvas=document.getElementById("canvas"),this.ctx=this.canvas.getContext("2d"),this.ctx.font="700 0.35em Fira Sans",this.ctx.textAlign="center",this.ctx.textBaseline="middle",this.xPos=this.canvas.width/2/this.size-8.66,this.yPos=this.canvas.height/2/this.size-10,this.style.paddingLeft=u()(document.defaultView.getComputedStyle(this.canvas,null)["paddingLeft"],10),this.style.paddingTop=u()(document.defaultView.getComputedStyle(this.canvas,null)["paddingTop"],10),this.style.borderLeft=u()(document.defaultView.getComputedStyle(this.canvas,null)["borderLeftWidth"],10),this.style.borderTop=u()(document.defaultView.getComputedStyle(this.canvas,null)["borderTopWidth"],10),this.style.htmlLeft=document.body.parentNode.offsetLeft,this.style.htmlTop=document.body.parentNode.offsetTop,this.drawCubes(0,this.size)},handleMouseDown:function(e){this.dragging=!0;for(var t=this.getRelativeMousePos(e),n=t.x*this.canvasScale,i=t.y*this.canvasScale,s=this.visibleCubes.length-1;s>=0;s--){var o=this.visibleCubes[s];if(this.cubeContains(o,n,i)){if(this.drawIndex=s,e.button===this.controls.paint)return void this.$emit("painton",o.i,o.j,o.k,this.$event);e.button===this.controls.break&&this.$emit("breakon",o.id,this.$event)}}},handleMouseUp:function(e){if(e.button===this.controls.break){this.dragging=!1;for(var t=this.getRelativeMousePos(e),n=t.x*this.canvasScale,i=t.y*this.canvasScale,s=this.visibleCubes.length-1;s>=0;s--){var o=this.visibleCubes[s];if(this.cubeContains(o,n,i))return this.drawIndex=s,void this.$emit("break",o)}}},handleMouseMove:function(e){this.selectedCube&&(this.selectedCube.selected=!1,this.selectedCube=null);for(var t=this.getRelativeMousePos(e),n=t.x*this.canvasScale,i=t.y*this.canvasScale,s=this.visibleCubes.length-1;s>=0;s--){var o=this.visibleCubes[s];if(this.cubeContains(o,n,i))return this.selectCube(o,s),void(this.dragging&&this.$emit("paint",o.i,o.j,o.k))}},selectCube:function(e,t){this.drawIndex=this.selectedIndex,this.selectedCube=e,this.selectedIndex=t,this.drawSelectedClue(this.ctx,36*this.n/8,15*this.n/8,this.n/8),this.selectedCube.selected=!0},getRelativeMousePos:function(e){var t=this.canvas,n=0,i=0;if(void 0!==t.offsetParent)do{n+=t.offsetLeft,i+=t.offsetTop}while(t=t.offsetParent);n+=this.style.paddingLeft+this.style.borderLeft+this.style.htmlLeft,i+=this.style.paddingTop+this.style.borderTop+this.style.htmlTop;var s=e.pageX-n,o=e.pageY-i;return{x:s,y:o}},cubeContains:function(e,t,n){var i=this.size,s=this.getTotalCubePos(e),o=i*s.x,r=i*s.y;return t>=o&&t<=17.32*i+o&&n>=5*i-5/8.66*(t-o)+r&&n>=-5*i+5/8.66*(t-o)+r&&n<=15*i+5/8.66*(t-o)+r&&n<=25*i-5/8.66*(t-o)+r},drawSelectedClue:function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:.5,s=i;this.drawCubeOutline(e,t,n,s,"#000",.6),e.fillStyle="#444",e.fill(),e.lineWidth=.2*s,e.beginPath(),e.moveTo(t,n+5*s),e.lineTo(t+8.66*s,n+10*s),e.lineTo(t+17.32*s,n+5*s),e.moveTo(t+8.66*s,n+10*s),e.lineTo(t+8.66*s,n+20*s),e.stroke(),e.save(),this.ctx.setTransform(1,0,0,1,0,0),this.drawClue(this.ctx,t/i,n/i,this.visibleClues[this.selectedIndex],i*this.size),e.restore()},drawCubes:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;if(!this.loading){this.ctx.scale(t,t),0===e&&this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);for(var n=e;n<this.visibleCubes.length;n++){var i=this.cubePositions[n].x,s=this.cubePositions[n].y;this.drawCube(this.ctx,i,s,this.visibleCubes[n],this.visibleHighlit[n]),this.ctx.setTransform(1,0,0,1,0,0),this.drawClue(this.ctx,i,s,this.visibleClues[n],this.size)}}},drawCube:function(e,t,n,i,s){var o="hsl(45, 20%, 96%)",r="hsl(45, 20%, 80%)",a="hsl(45, 20%, 64%)";i.strike?(o="hsl(0, 50%, 80%)",r="hsl(0, 50%, 70%)",a="hsl(0, 30%, 50%)"):i.painted&&(o="hsl(180, 50%, 80%)",r="hsl(180, 50%, 70%)",a="hsl(180, 30%, 50%)"),this.fillTopFace(e,t,n,o),this.fillLeftFace(e,t,n,r),this.fillRightFace(e,t,n,a),this.drawCubeOutline(e,t,n,1,"#000",.75),s||(e.fillStyle="hsla(45, 46%, 10%, 0.6)",e.fill()),i.selected&&(e.fillStyle="hsla(45, 40%, 50%, 0.4)",e.fill())},fillTopFace:function(e,t,n,i){e.fillStyle=i,e.beginPath(),e.moveTo(t+8.66,n),e.lineTo(t,n+5),e.lineTo(t+8.66,n+10),e.lineTo(t+17.32,n+5),e.closePath(),e.fill()},fillLeftFace:function(e,t,n,i){e.fillStyle=i,e.beginPath(),e.moveTo(t,n+5),e.lineTo(t,n+15),e.lineTo(t+8.66,n+20),e.lineTo(t+8.66,n+10),e.closePath(),e.fill()},fillRightFace:function(e,t,n,i){e.fillStyle=i,e.beginPath(),e.moveTo(t+8.66,n+10),e.lineTo(t+8.66,n+20),e.lineTo(t+17.32,n+15),e.lineTo(t+17.32,n+5),e.closePath(),e.fill()},drawCubeOutline:function(e,t,n,i,s,o){e.lineWidth=o*i,e.beginPath(),e.moveTo(t+8.66*i,n),e.lineTo(t,n+5*i),e.lineTo(t,n+15*i),e.lineTo(t+8.66*i,n+20*i),e.lineTo(t+17.32*i,n+15*i),e.lineTo(t+17.32*i,n+5*i),e.closePath(),e.stroke()},drawClue:function(e,t,n,i,s){e.transform(s,0,0,s,0,0),e.fillStyle="rgba(0, 0, 0, 0.9)",e.strokeStyle="rgba(0, 0, 0, 0.9)",e.lineWidth=.5;var o=3.4;i.t.isVisible&&(e.save(),e.transform(1,0,0,1,t+8.66,n+5),e.rotate(-Math.PI/3),e.transform(.866,.57735,0,1,0,0),e.fillText(i.t.count,0,0),2===i.t.groups?(e.beginPath(),e.arc(0,0,o,0,2*Math.PI),e.stroke()):i.t.groups>2&&(e.beginPath(),e.moveTo(-o,.25-o),e.lineTo(o,-o-.25),e.lineTo(o,o-.25),e.lineTo(-o,o+.25),e.closePath(),e.stroke()),e.restore()),i.l.isVisible&&(e.save(),e.transform(.866,.57735,0,1,t+4.33,n+12.5),e.fillText(i.l.count,0,0),2===i.l.groups?(e.beginPath(),e.arc(0,0,o,0,2*Math.PI),e.stroke()):i.l.groups>2&&(e.beginPath(),e.moveTo(-o,.25-o),e.lineTo(o,-o-.25),e.lineTo(o,o-.25),e.lineTo(-o,o+.25),e.closePath(),e.stroke()),e.restore()),i.r.isVisible&&(e.save(),e.transform(.866,-.57735,0,1,t+12.99,n+12.5),e.fillText(i.r.count,0,0),2===i.r.groups?(e.beginPath(),e.arc(0,0,o,0,2*Math.PI),e.stroke()):i.r.groups>2&&(e.beginPath(),e.moveTo(-o,-o-.25),e.lineTo(o,.25-o),e.lineTo(o,o+.25),e.lineTo(-o,o-.25),e.closePath(),e.stroke()),e.restore())},getTotalCubePos:function(e){return{x:this.xPos+-8.66*e.i+8.66*e.j,y:this.yPos+5*e.i+5*e.j-10*e.k}}}}),h=c,d=n("2877"),f=Object(d["a"])(h,r,a,!1,null,"b5b2ec8e",null),v=f.exports,b=n("ebb0"),p=n.n(b),m=n("47bd"),g=n.n(m),w=new p.a(new g.a),y=function(e){return w.postMessage(e)},k={send:y},x={name:"app",components:{NonaCanvas:v},data:function(){return{grid:[],clueGrids:{l:[],r:[],t:[]},sections:[],newN:5,newDensity:.4,newRemoval:1,newOptions:{metaballs:12,noise:.9},n:5,loading:!1,paintEnabled:!1,breakableId:"",paintType:!0,progress:0,sectionX:1,sectionY:6,strikes:0,showMenu:!1,type:"uniform",controls:{break:2,paint:0},reducerPainted:function(e,t){return(e<<1)+t.painted},reducerUnbroken:function(e,t){return(e<<1)+!t.broken}}},computed:{cubeArr:function(){return this.grid.flat(2)},cubeVisibility:function(){for(var e=[],t=0;t<this.cubeArr.length;++t){var n=this.cubeArr[t];e[t]=!n.broken&&n.j<this.sectionY&&n.i<this.n+2-this.sectionX}return e},cubeHighlight:function(){for(var e=[],t=0;t<this.cubeArr.length;++t){var n=this.cubeArr[t];e[t]=n.j==this.sectionY-1&&1==this.sectionX||n.i==-(this.sectionX-this.n-1)&&this.sectionY==this.n+1||this.sectionY==this.n+1&&1==this.sectionX}return e},numSolid:function(){return this.fastReduce(this.cubeArr,function(e,t){return e+t.solid},0)},numPainted:function(){return this.fastReduce(this.cubeArr,function(e,t){return e+t.painted},0)},numBroken:function(){return this.fastReduce(this.cubeArr,function(e,t){return e+t.broken},0)},clueArr:function(){return this.clueGrids.l.concat(this.clueGrids.r,this.clueGrids.t).flat()},solved:function(){return Math.pow(this.n,3)-this.numSolid-this.numBroken===0&&this.numPainted===this.numSolid}},created:function(){this.generatePuzzleInWorker(5,.4,1,"uniform",this.newOptions)},mounted:function(){},methods:{generatePuzzleInWorker:function(e,t,n,i,s){var o=this;this.strikes=0,k.send({command:"generate",size:e,density:t,removal:n,type:i,options:s}).then(function(t){o.n=e,o.grid=t.grid,o.clueGrids=t.clueGrids,o.resetPuzzle(),o.resetSectionView()})},generateSolvedInWorker:function(e,t,n,i,s){var o=this;this.strikes=0,k.send({command:"generate",size:e,density:t,removal:n,type:i,options:s}).then(function(t){o.n=e,o.grid=t.grid,o.clueGrids=t.clueGrids,o.resetSectionView()})},solveInWorker:function(){var e=this;k.send({command:"solve",grid:this.grid,clueGrids:this.clueGrids}).then(function(t){e.grid=t.grid,e.clueGrids=t.clueGrids})},solveIterationInWorker:function(){var e=this;k.send({command:"solve-iteration",grid:this.grid,clueGrids:this.clueGrids}).then(function(t){e.grid=t.grid,e.clueGrids=t.clueGrids})},resetPuzzle:function(){for(var e=0;e<this.cubeArr.length;e++)this.cubeArr[e].painted=!1,this.cubeArr[e].broken=!1;for(var t=0;t<3*this.n*this.n;t++)this.clueArr[t].isSolved=!1},clearSelection:function(){window.getSelection?window.getSelection().removeAllRanges():document.selection&&document.selection.empty()},enablePaint:function(e,t,n){this.paintEnabled=!0,this.paintType=!this.grid[e][t][n].painted,this.paintCube(e,t,n)},enableBreak:function(e){""===this.breakableId&&(this.breakableId=e)},disablePaint:function(){this.paintEnabled=!1},paintCube:function(e,t,n){this.paintEnabled&&(this.grid[e][t][n].painted=this.paintType)},breakCube:function(e){e.id!==this.breakableId||e.painted?this.breakableId="":(e.solid?e.strike||(e.strike=!0,this.strikes++):e.broken=!0,this.breakableId="")},swapControls:function(){var e=this.controls.break;this.controls.break=this.controls.paint,this.controls.paint=e},resetSectionView:function(){this.sectionY=this.n+1,this.sectionX=1},testLines:function(){for(var e=[[4,2,2,11,0,0,8],[5,2,2,31,4,10,0],[5,3,2,29,0,0,9],[5,3,2,31,0,0,0],[5,3,2,23,18,0,0],[5,3,2,29,5,16,8],[5,3,2,31,24,4,0],[5,3,3,31,0,10,21],[6,4,3,63,0,0,33],[7,2,2,127,2,5,0],[7,3,2,121,24,32,0],[7,3,3,85,65,0,0],[7,4,2,127,74,49,4],[7,4,3,119,66,32,16],[8,4,2,249,65,8,32],[8,4,3,191,44,18,0],[8,5,3,255,25,0,0],[8,6,3,239,236,2,1],[9,3,3,511,8,20,0],[10,3,1,751,0,512,0]],t=!0,n=0;n<e.length;n++){var i=e[n],s=this.testLine(i[0],i[1],i[2],i[3],i[4],i[5],i[6]);t=t&&s}console.log(t)},testPlaceRight:function(){for(var e=[[[1,2],121,24,7],[[2,1],79,12,7]],t=0;t<e.length;t++){var n=e[t];console.log(n[0]),console.log("R "+this.mergeBlocks(this.placeRight(n[0],n[1],n[2])).toString(2)),console.log("L "+this.mergeBlocks(this.placeLeft(n[0],n[1],n[2],n[3])).toString(2))}},testLine:function(e,t,n,i,s,o,r){var a=this.solveLine(s,i,e,t,n);return console.log("------ "+t+" / "+n+" ------"),console.log("painted: "+s.toString(2)),console.log("unbroke: "+i.toString(2)),console.log("paint: "+a.paint.toString(2)),console.log("break: "+a.break.toString(2)),r===a.paint&&o===a.break},fastReduce:function(e,t){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e[0],i=n,s=0;s<e.length;s++)i=t(i,e[s],s,e);return i},getRandomInt:function(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e))+e},computeDistanceSquared:function(e,t){return Math.pow(e[0]-t[0],2)+Math.pow(e[1]-t[1],2)+Math.pow(e[2]-t[2],2)},findValidCompositions:function(e,t,n){var i=[];return this.findCompositions(i,e,t),i.filter(function(t){return e+t.length-1<=n})},findCompositions:function(e,t,n){if(n>2){for(var i=[],s=0;s<t;s++)i.push(1);e.push(i),this.findSets(e,i.slice(0),0)}else for(var o=1;o<t;o++)e.push([o,t-o])},findSets:function(e,t,n){if(!(t.length<=3||1!=t.pop()))for(var i=n;i<t.length;i++)t[i]+=1,e.push(t.slice(0)),this.findSets(e,t.slice(0),i),t[i]-=1},ones:function(e){return Math.pow(2,e)-1},countMaxConsecutiveOnes:function(e){var t=0;while(0!=e)e&=e<<1,t++;return t},makeSingles:function(e){for(var t=e,n=[],i=0,s=1;e;s++)1&e&&(n.push(this.ones(s)&t^i),i|=this.ones(s)&t),e>>=1;return n},makeBlocks:function(e){for(var t=e,n=[],i=0,s=1;e;s++)1&e&&!(e>>1&1)&&(n.push(this.ones(s)&t^i),i|=this.ones(s)&t),e>>=1;return n},mergeBlocks:function(e){for(var t=0,n=0;n<e.length;n++)t|=e[n];return t},countOnes:function(e){var t=0;for(t=0;e;t++)e&=e-1;return t},reverseNBits:function(e,t){var n=1&e;while(--t)e>>=1,n<<=1,n|=1&e;return n}}},C=x,P=(n("5c0b"),Object(d["a"])(C,s,o,!1,null,null,null)),T=P.exports;i["a"].config.productionTip=!1,new i["a"]({render:function(e){return e(T)}}).$mount("#app")},"5c0b":function(e,t,n){"use strict";var i=n("5e27"),s=n.n(i);s.a},"5e27":function(e,t,n){}});
//# sourceMappingURL=app.5568545d.js.map