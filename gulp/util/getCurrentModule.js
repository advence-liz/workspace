const fs = require('fs-extra')

const { defaultDemo, qrcPath } = require('../config').q

module.exports = () => {
  let CurrentModule
  try {
    CurrentModule = fs.readJsonSync(qrcPath).module
  } catch (error) {
    fs.writeJsonSync(qrcPath, { module: defaultDemo })
  }
  return CurrentModule || defaultDemo
}
// console.log(CurrentModule)
