var cache = {}
var fib = function(n) {
  function fn(n) {
    if (cache[n] !== undefined) {
      return cache[n]
    } else {
      if (n === 0) return 0
      else if (n === 1) return 1
      else {
        var r = fn(n - 1) + fn(n - 2)
        cache[n] = r
        console.log(`cache[${n}]=${r}`)
        return r
      }
    }
  }

  return fn(n)
}

var r = fib(7)
console.log(r)
