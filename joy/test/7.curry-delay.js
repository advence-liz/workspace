/**
 * curry(fn,...args)
 */

function curry(fn, ...args) {
    if (args.length === fn.length) {
        return fn(...args)
    }

    return (...rest) => {
        return curry(fn, ...args, ...rest)
    }
}

function add(x, y, z) {
    return x + y + z
}

const curryAdd = curry(add,1)

const r = curryAdd(2)(3)
console.log(r)
