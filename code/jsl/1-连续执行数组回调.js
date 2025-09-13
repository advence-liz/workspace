var fn = (x) => {
    console.log(x)
    return new Promise((resolve) => {
        setTimeout(resolve, 1000, x + 1)
    })
    // return Promise.resolve(x + 1)
}
var arr = [fn, fn, fn]

var p = Promise.resolve(1)

for (let i = 0; i < arr.length; i++) {
    var cb = arr[i]
    p = p.then(cb)
}
