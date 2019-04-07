var Koa = require('Koa')
var http = require('http')
var https = require('https')
var fs = require('fs')

var app = new Koa()

// index page
app.use(async ctx => {
  ctx.body = 'hello world from  prx'
})

// SSL options
// var options = {
//   key: fs.readFileSync('./cert/server-key.pem'), // ssl文件路径
//   cert: fs.readFileSync('./cert/server-cert.pem') // ssl文件路径
// }
var options = {
  pfx: fs.readFileSync('./cert/server.pfx'),
  passphrase: '1234'
}

// start the server
http.createServer(app.callback()).listen(8080)
https.createServer(options, app.callback()).listen(8443)

//
console.log('https server is running')
