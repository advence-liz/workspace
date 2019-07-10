var Koa = require('koa')
const koaBody = require('koa-body')
var Router = require('koa-router')
const cors = require('@koa/cors')
var fs = require('fs')

var app = new Koa()
var router = new Router()
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    }
  })
)
app.use(cors({ origin: '*' }))
// app.use(async (ctx, next) => {
//   ctx.set('Access-Control-Allow-Origin', '*')
//   ctx.set(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   )
//   ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
//   await next()
// })
router.post('/upload', async ctx => {
  const file = ctx.request.files.file // 获取上传文件
  const reader = fs.createReadStream(file.path) // 创建可读流
  const ext = file.name.split('.').pop() // 获取上传文件扩展名
  const upStream = fs.createWriteStream(
    `upload/${Math.random().toString()}.${ext}`
  ) // 创建可写流
  reader.pipe(upStream) // 可读流通过管道写入可写流
  return (ctx.body = '上传成功')
})
app.use(router.routes())

app.use(async ctx => {
  console.log('Hello World')
})

app.listen(3003)
