// const QRCode = require('qrcode')

// QRCode.toString('http://www.google.com', function(err, string) {
//   if (err) throw err
//   console.log(string)
// })
var qrcode = require('qrcode-terminal');


// qrcode.generate('http://github.com');


qrcode.generate(`https://github.com/advence-liz/json-server-router`);

