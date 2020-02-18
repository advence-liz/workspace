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
function add (x, y) {
  if (x && y) {
    return x + y
  }
  if (!y) {
    return add.bind(null, x)
  }
}

function curry (fn) {}
