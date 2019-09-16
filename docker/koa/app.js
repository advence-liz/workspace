const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
  ctx.body = 'Hello World1'
})

app.listen(3000)
