import { async } from '../../../../Library/Caches/typescript/3.6/node_modules/rxjs/internal/scheduler/async'

// function* fibonacci() {
//   yield 0
//   yield 1
//   yield 1
//   let [prev, curr] = [1, 1]
//   while (true) {
//     //                    n-2    n-1
//     [prev, curr] = [curr, prev + curr]
//     yield curr
//   }
// }

// function fibonacci2(n){
//   if(n === 1 || n === 0 ) return n
//   return fibonacci(n-1) + fibonacci(n-2)
// }


/**
 *        | 0 , n = 0
 * F(n) = | 1 , n = 1
 *        | F(n-1)+F(n-2), n > 1
 */

function* fibonacci() {
    let t0 = 0
    let t1 = 1
    yield t0
    yield t1

    while (true) {
        [t0, t1] = [t1, t0 + t1]
        yield t1
    }
}

function getFibonacci(n) {
    var gen = fibonacci()
    var ret = -1
    for (var i = 0; i <= n; i++) {
        ret = gen.next().value
    }

    return ret
}

var test = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

var isPass = test.every((value, index) => {
    var f = getFibonacci(index)
    console.log(f, value)
    return f === value

})

console.log('isPass', isPass)


// https://mrxf.github.io/2017/09/21/my-view-of-fibonacci/
// https://blog.csdn.net/qq_39300332/article/details/80000837


