const fs = require('fs')
const path = require('path')
let dirs = fs.readdirSync(path.join(__dirname))

function capitalize([first, ...rest]) {
  return first.toUpperCase() + rest.join('')
}

function getPascal(x) {
  let arr = x.split(/\b/)
  let str = capitalize(x)
  if (arr.length > 1) {
    str = arr.reduce(function(x, y) {
      return capitalize(x) + capitalize(y)
    })
  }
  return str.replace(/-/g, '')
}
dirs = dirs.filter(dir => {
  let filterReg = /(.js|.scss|list-header)$/
  return !filterReg.test(dir)
})
let result = dirs.map(function(from) {
  let name = getPascal(from)

  return `export { default as ${name} } from './${from}'`
})
console.log(result)
let str = result.join(`\n`)
fs.writeFileSync(path.join(__dirname, 'index.js'), str)
