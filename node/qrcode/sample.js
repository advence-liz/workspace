const QRCode = require('qrcode')

QRCode.toString('http://www.google.com', function (err, string) {
  if (err) throw err
  console.log(string)
})