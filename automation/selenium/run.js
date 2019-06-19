const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const driverPath = path.resolve('driver')
const qsrc = JSON.parse(
  fs
    .readFileSync(require.resolve(path.join(__dirname, '.qsrc.json')))
    .toString()
)
const { root, module: currentModule } = qsrc

exec(
  `export PATH=${driverPath}:$PATH ;node ${root}/${currentModule}/index.js`,
  function (error, stdout, stderr) {
    if (error) {
      console.error('error: ' + error)
      return
    }
    console.log('stdout: ' + stdout)
    console.log('stderr: ' + typeof stderr)
  }
)
