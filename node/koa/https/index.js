var https = require('https')
var fs = require('fs')

var options = {
    key: fs.readFileSync('./cert/server-key.pem'),
    ca: [fs.readFileSync('./cert/ca-cert.pem')],
    cert: fs.readFileSync('./cert/server-cert.pem')
}

https
    .createServer(options, function(req, res) {
        res.writeHead(200)
        res.end('hello world\n')
    })
    .listen(3000, '127.0.0.1')
