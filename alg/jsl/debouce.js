// 你是否在日常开发中遇到一个问题，在滚动事件中需要做个复杂计算或者实现一个按钮的防二次点击操作。
// 这些需求都可以通过函数防抖动来实现。尤其是第一个需求，如果在频繁的事件回调中做复杂计算，
// 很有可能导致页面卡顿，不如将多次计算合并为一次计算，只在一个精确点做操作。
// PS：防抖和节流的作用都是防止函数多次调用。区别在于，假设一个用户一直触发这个函数，
// 且每次触发函数的间隔小于wait，防抖的情况下只会调用一次，而节流的 情况会每隔一定时间（参数wait）调用函数。

/**
 *
 * @param {function} fn
 * @param {number} wait
 * @returns {function}
 *
 */
function debouce(fn, wait, immediate) {
    var timer = null
    return function(...args) {
        if (immediate) {
            if (!timer) {
                fn.call(this, ...args)
            } else {
                clearTimeout(timer)
                timer = setTimeout(fn.bind(this), wait, ...args)
            }
        } else {
            clearTimeout(timer)
            timer = setTimeout(fn.bind(this), wait, ...args)
        }
    }
}

function log() {
    console.log(new Date().toString())
}

var d = debouce(log, 500)

for (let i = 0; i < 5; i++) {
    d()
}
