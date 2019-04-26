import Matter, { Composites } from 'matter-js'

const Engine = Matter.Engine

const Render = Matter.Render

const World = Matter.World

const Bodies = Matter.Bodies
const engine = Engine.create()
const render = Render.create({
  element: document.body,
  //   canvas: document.getElementById('canvas'),
  //   context: document.getElementById('canvas').getContext('2d'),
  engine: engine,
  options: {
    width: 800,
    height: 400,
    wireframes: false
  }
})
const boxA = Bodies.rectangle(400, 200, 80, 80)
const ballA = Bodies.circle(380, 100, 40, 10)
const ballB = Bodies.circle(460, 10, 40, 10)
const ground = Bodies.rectangle(400, 380, 800, 10, { isStatic: true })
const pyramid = Composites.pyramid(0, 220, 11, 6, 0, 0, function (x, y) {
  return Bodies.rectangle(x, y, 30, 30, {
    render: {
      fillStyle: 'cornflowerblue',
      strokeStyle: 'black'
    }
  })
})
World.add(engine.world, [boxA, ballA, ballB, ground, pyramid])
Engine.run(engine)
Render.run(render)
