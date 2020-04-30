const Koa = require('koa')
const app = new Koa()
// Constants
const PORT = 3000
const HOST = '0.0.0.0'

app.use(async ctx => {
    ctx.body = 'Hello World12'
})

console.log(PORT, HOST)
app.listen(PORT)
