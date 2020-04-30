/**
 * debounce(fn,wait,)
 */
function debouce(fn, wait, immediate) {
    let timer = null

    return (...rest) => {
        if (immediate && !timer) {
            fn.call(this, ...rest)
        }
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this, ...rest), wait)
    }
}

function log() {
    console.log(new Date().toString())
}

var d = debouce(log, 500, true)

for (let i = 0; i < 5; i++) {
    d()
}
