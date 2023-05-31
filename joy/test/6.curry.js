/**
 * curry(fn,...args)
 */

function curry(fn, ...args) {
    return (...rest) => {
        return fn(...args, ...rest)
    }
}

function add(x, y, z) {
    return x + y + z
}

const curryAdd = curry(add, 1)

const curryAdd1 = curry(curryAdd, 2, 3)

const r = curryAdd1(2, 3)

console.log(r)
