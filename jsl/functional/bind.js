/**
 * fn.bind(context,...args)
 * @return
 */

Function.prototype.myBind = function(context = window, ...rest) {
  const fn = this
  context.fn = fn

  return function(...args) {
    const result = context.fn(...rest, ...args)
    delete context.fn
    return result
  }
}

function test(...rest) {
  console.log(this.name)
  console.log(rest)
}

var testBind = test.myBind({ name: 'liz' }, 1)

testBind(2, 3)
