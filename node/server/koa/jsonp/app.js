const Koa = require('koa')

const bodyParser = require('koa-bodyparser')
const views = require('koa-views')

// Must be used before any router is used

const app = new Koa()
app.use(
    views(__dirname + '/views', {
        map: {
            html: 'underscore'
        }
    })
)
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
    const start = new Date().getTime()
    await next()
    const execTime = new Date().getTime() - start
    ctx.response.set('X-Response-Time', `${execTime}ms`)
})

// static file support:

let staticFiles = require('./static-files')
app.use(staticFiles('/static/', __dirname + '/static'))

// parse request body:
app.use(bodyParser())
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
    const start = new Date().getTime()
    await next()
    const execTime = new Date().getTime() - start
    ctx.response.set('X-Response-Time', `${execTime}ms`)
})
app.listen(3000)
console.log('app started at port 3000...')
