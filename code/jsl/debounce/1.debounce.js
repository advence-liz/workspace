function debouce(fn, wait, im) {
    let timer = null
    let runNow = im

    return function(...args) {
        if (runNow) {
            fn(...args)
            runNow = false
            return
        }

        clearTimeout(timer)
        timer = setTimeout(fn, wait, ...args)
    }
}

function log() {
    console.count('log')
    console.log(new Date().toString())
}

var d = debouce(log, 1000, true)

for (let i = 0; i < 5; i++) {
    d()
}
