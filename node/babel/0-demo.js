const parser = require('@babel/parser')
const traverse = require('@babel/traverse')
const generate = require('@babel/generator')

const code = `function square(n) {
  return n * n;
}`

const ast = parser.parse(code)

traverse.default(ast, {
  enter(path) {
    if (path.isIdentifier({ name: 'n' })) {
      path.node.name = 'x'
    }
  }
})
const output = generate.default(ast, {}, code)
console.log(output)
