function debounce(func, delay, immediate) {
    let timer = null

    return function (...args) {
        clearTimeout(timer)

        setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}
