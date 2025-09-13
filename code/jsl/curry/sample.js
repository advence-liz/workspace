// 使用示例
function sum(a, b, c) {
    return a + b + c
}

function curry(func) {
    return function curryFn(...args) {
        if (args.length >= func.length) {
            return func.apply(this, args)
        } else {
            return function (...rest) {
                return curryFn.apply(this, [...args, ...rest])
            }
        }
    }
}
const curriedSum = curry(sum)
console.log(curriedSum(1)(2)(3)) // 输出 6
console.log(curriedSum(1, 2)(3)) // 输出 6
