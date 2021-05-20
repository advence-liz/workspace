//文件下载
var fs = require('fs')
var path = require('path')
var request = require('request')

//创建文件夹目录
var dirPath = path.join(__dirname, 'file')
// if (!fs.existsSync(dirPath)) {
//   fs.mkdirSync(dirPath)
//   console.log('文件夹创建成功')
// } else {
//   console.log('文件夹已存在')
// }

//循环多线程下载
// for (let i = 0; i < 1; i++) {
let fileName = 'jsr.zip'
// let url =
//   'https://github.com/advence-liz/json-server-router/archive/refs/heads/master.zip'
// let stream = fs.createWriteStream(path.join(dirPath, fileName))
// request(url)
//   .pipe(stream)
//   .on('close', function(err) {
//     console.log('文件[' + fileName + ']下载完毕')
//   })
// // }

// fs.createReadStream(path.join(dirPath, 'jsr.zip')).pipe(
//   unzip.Extract({ path: path.join(dirPath, 'jsr') })
// )

var unzip = require('unzip')
fs.createReadStream(path.join(dirPath, 'jsr.zip')).pipe(
  unzip.Extract({ path: path.join(dirPath, 'jsr') })
)
