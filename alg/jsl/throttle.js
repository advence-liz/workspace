/**
 * throttle(fn,wait)
 */
function throttle(fn,wait){
    let prev = null

    return function(...args){
        let now = new Date().getTime()

        if(now-prev > wait) {
            prev = now
            return fn(...args)
        }

    }
}

function log(){
    console.log(new Date())
}
var tlog= throttle(log,200)

