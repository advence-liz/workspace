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
// https://juejin.im/post/5af13664f265da0ba266efcf

// var add = x => y => x + y

// function curry(fn,...args){
//   return function(...rest){
//     fn(...args,...rest)
//   }
// }

// var add = delayCurry(add)
// add(x)(y)(z)
function delayCurry(fn, ...args) {
    // if(fn.length >=args.length){
    //   return fn(...args)
    // }
    return function(...rest) {
        return delayCurry(fn, ...args, ...rest)
    }
}
