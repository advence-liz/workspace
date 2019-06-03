// 11235

// n= (n-1) + (n-2)

function f (n) {
  if (n === 0) {
    return 1
  } else if (n === 1) {
    return 1
  } else {
    return f(n - 1) + f(n - 2)
  }
}
for (let i = 0; i < 10; i++) {
  console.log(f(i))
}
