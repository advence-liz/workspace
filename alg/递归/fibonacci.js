function* fibonacci() {
  yield 1
  yield 1
  let [prev, curr] = [1, 1]
  while (true) {
    //                    n-2    n-1
    [prev, curr] = [curr, prev + curr]
    yield curr
  }
}

function fibonacci2(n){
  if(n === 1 || n === 0 ) return n
  return fibonacci(n-1) + fibonacci(n-2)
}
function* fibonacci1(){
  let current = 0
  let next = 1
  yield current
  yield next

  while(true) {
    [current, next] = [next, current + next]
    yield next
  }
}

// https://mrxf.github.io/2017/09/21/my-view-of-fibonacci/
// https://blog.csdn.net/qq_39300332/article/details/80000837