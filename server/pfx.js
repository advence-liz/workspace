var https = require('https')
var fs = require('fs')

var options = {
  pfx: fs.readFileSync('./cert/server.pfx'),
  passphrase: '1234'
}

https
  .createServer(options, function (req, res) {
    res.writeHead(200)
    res.end('hello world pfx \n')
  })
  .listen(3000, '127.0.0.1')
