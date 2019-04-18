var sun = new Image()
var moon = new Image()
var earth = new Image()
var ctx = document.getElementById('canvas').getContext('2d')

function init () {
  sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png' // 300*300
  moon.src = 'https://mdn.mozillademos.org/files/1443/Canvas_moon.png' // 24*24
  earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png' // 7*7
  window.requestAnimationFrame(draw)
}

function draw () {
  // ctx.globalCompositeOperation = 'destination-over'
  var time = new Date()
  ctx.clearRect(0, 0, 300, 300) // clear canvas
  ctx.beginPath()
  ctx.arc(150, 150, 5, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.save()
  ctx.translate(150, 150)
  ctx.rotate(
    ((2 * Math.PI) / 60) * time.getSeconds() +
      ((2 * Math.PI) / 60000) * time.getMilliseconds()
  )
  ctx.fillRect(0, 0, 50, 50)
  ctx.restore()
  window.requestAnimationFrame(draw)
}
init()
