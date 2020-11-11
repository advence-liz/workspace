// function curry(fn, ...args) {
//     return function(...rest) {
//         fn.call(this, ...args, ...rest)
//     }
// }
// function log(...args) {
//     console.log(this, ...args)
// }
// var liz = { name: 'liz', log: curry(log, 1) }

// liz.log(2)

function Test() {
    function log() {
        return () => {
            console.log(this)
        }
    }

    this.log = function() {
        return log()
    }
}

// var t = new Test()
// t.log()()

function context() {
    this.name = 'eee'
    this.log = function() {
        obj.log()
    }
    let obj = {
        log: () => {
            console.log(this)
        }
    }
}

var c = new context()
c.log()
