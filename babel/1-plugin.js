const parser = require('@babel/parser')
const { transform, generate } = require('@babel/core')

const code = `function square(n) {
  return n * n;
}`

const r = transform(code, {
    plugins: [
        () => ({
            visitor: {
                Identifier: {
                    enter(path) {
                        if (path.isIdentifier({ name: 'n' })) {
                            path.node.name = 'x'
                        }
                    }
                }
            }
        })
    ]
})
console.log(r)
