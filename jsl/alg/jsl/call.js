/**
 * fn.call(context,...args)
 */
Function.prototype.myCall = function(context = window, ...rest) {
    const fn = this
    context.fn = fn
    const result = context.fn(...rest)
    delete context.fn
    return result
}

function test(x, y) {
    console.log(this.name)
    console.log(x, y)
}

test.myCall({ name: 'liz' }, 1, 2)
