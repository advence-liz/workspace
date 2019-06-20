const fs = require('fs-extra')
const path = require('path')
const exec = require('child_process').exec
const driverPath = path.resolve('driver')

const qsrc = fs
  .readFileSync(require.resolve(path.join(__dirname, '.qsrc.json')))
  .toString()

const { root, module: currentModule } = JSON.parse(qsrc)

exec(
  `export PATH=${driverPath}:$PATH ;node ${root}/${currentModule}/index.js`,
  function(error, stdout, stderr) {
    if (error) {
      console.error('error: ' + error)
      return
    }
    console.log('stdout: ' + stdout)
    console.log('stderr: ' + stderr)
  }
)
