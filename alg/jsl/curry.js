/**
 * 以 add(1)(2) 的形式实现加法
 */

// 如运行
// add(1)(2)
// 结果为
// 3
/* ============= 从这里开始写代码 ============== */
// function add() {

// }
/* ================ 到这里结束 ================ */
// https://www.zhangxinxu.com/wordpress/2013/02/js-currying/

// const add = x=>y => x+y

// console.log(add(1)(2))

// function add(x,y){
//   return x+y
// }
// function curry(fn,...args){

//   return function (...rest){
//     return fn(...args,...rest)
//   }
// }

// var r=curry(add,1)(2)
// console.log(r)

function add(x, y, z) {
  return x + y + z
}

function curry(fn, ...args) {
  if (args.length >= fn.length) {
    return fn(...args)
  }
  return function(...rest) {
    return curry(fn, ...args, ...rest)
  }
}
var r = curry(add, 1)(2)(3)
console.log(r)
