var express = require('express')
var fs = require('fs')
var http = require('http')
var https = require('https')

var privateKey = fs.readFileSync('cert/server-key.pem')
var certificate = fs.readFileSync('cert/server-cert.pem')

var credentials = { key: privateKey, cert: certificate }

var app = express()
app.get('/', function(req, res) {
    res.send('hello dd')
})

var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)

httpServer.listen(8080)
httpsServer.listen(8443)
