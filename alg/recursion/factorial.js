const { log } = console
function factorial (n) {
  if (n === 1) {
    return 1
  } else {
    return n * factorial(n - 1)
  }
}

log(factorial(3))
log(factorial(4))
