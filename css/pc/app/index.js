var el = document.getElementById('canvas')
var ctx = el.getContext('2d')
// el.addEventListener('touchstart', log, false)
// el.addEventListener('touchend', log, false)
// el.addEventListener('touchcancel', log, false)
el.addEventListener('touchmove', log, false)

// function log ({ type, touches: [{ clientX, clientY }] }) {
//   console.log(type, clientX, clientY)
// }
function log(e) {
 console.log(e)
}
function Block(x, y) {
 this.x = x
 this.y = y
 this.dx = true
 this.dy = true
 this.curx = () => {
  if (this.x > 300 - 25) this.dx = false
  if (this.x < 5) this.dx = true

  if (this.dx) {
   return (this.x += parseInt(Math.random() * 3))
  }
  return (this.x -= parseInt(Math.random() * 3))
 }
 this.cury = () => {
  if (this.y > 300 - 25) this.dy = false
  if (this.y < 5) this.dy = true

  if (this.dy) {
   return (this.y += parseInt(Math.random() * 3))
  }
  return (this.y -= parseInt(Math.random() * 3))
 }

 this.render = () => {
  ctx.fillRect(this.curx(), this.cury(), 20, 20)
 }
}

const blocks = [
 new Block(150, 20),
 new Block(150, 20),
 new Block(150, 20),
 new Block(150, 20),
 new Block(150, 20),
 new Block(150, 20),
 new Block(150, 20)
]

function init() {
 window.requestAnimationFrame(draw)
}

function draw() {
 // ctx.globalCompositeOperation = 'destination-over'
 ctx.clearRect(0, 0, 300, 300)
 blocks.forEach(block => block.render())

 window.requestAnimationFrame(draw)
}
init()
