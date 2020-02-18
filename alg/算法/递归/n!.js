function factorial (n,level=0) {
  // if(level>=5) {
  //   console.log('overflow',level)
  //   return
  // }
  console.log(level)
  if (n <= 0) return -1
  if (n === 1) return 1

  return n * factorial(n - 1,level+1)
}
let a = factorial(5)
let b = factorial(7)


