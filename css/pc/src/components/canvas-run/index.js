class Block {
  constructor (x, y, ctx) {
    this.x = x
    this.y = y
    this.target = [x, y]
    this.ctx = ctx
  }
  render () {
    let [tx, ty] = this.target

    // 临界值
    if (tx === this.x && ty === this.y) {
      this.ctx.fillRect(this.x, this.y, 20, 20)
      return
    }

    let dx = tx - this.x
    let dy = ty - this.y

    this.x = dx ? (this.x += dx / Math.abs(dx)) : this.x
    this.y = dy ? (this.y += dy / Math.abs(dy)) : this.y
    // this.x = (dx / Math.abs(dx)) * Math.min(this.x, tx)
    // this.y = (dy / Math.abs(dy)) * Math.min(this.y, ty)

    this.ctx.fillRect(this.x, this.y, 20, 20)
  }
}

class Page {
  constructor () {
    this.el = document.getElementById('canvas')
    this.ctx = this.el.getContext('2d')
    this.el.addEventListener('touchstart', this.run, false)
    this.block = new Block(0, 0, this.ctx)
  }
  init () {
    window.requestAnimationFrame(this.draw)
  }
  run = ({ type, touches: [{ clientX, clientY }] }) => {
    this.block.target = [parseInt(clientX), parseInt(clientY)]
  }
  draw = () => {
    this.ctx.clearRect(0, 0, 300, 300)
    this.block.render()
    window.requestAnimationFrame(this.draw)
  }
}
new Page().init()
