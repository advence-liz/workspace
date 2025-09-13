function throttle(func, delay) {
    let isThrottle = false

    return function (...args) {
        if (isThrottle) return
        func.apply(this, args)
        isThrottle = true
        setTimeout(() => {
            isThrottle = false
        }, delay)
    }
}

function doSomthing() {
    console.log(Date.now())
}

console.log('strat', Date.now())
var throttleFn = throttle(doSomthing, 1000)
throttleFn()
throttleFn()
throttleFn()
throttleFn()
setTimeout(throttleFn, 1000)
