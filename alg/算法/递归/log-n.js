const { log } = console
function logn (n) {
    if (n > 0) {
        log(n)
        logn(n - 1)
    }
}
logn(5)