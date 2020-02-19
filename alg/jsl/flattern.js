/**
 * 数组扁平化
 */

// 如数组为
var list = [1, [2, 3, [4, 5]], [1, 2, 3, [4, 5]]]
// 请实现函数 flatten，将数组转为：
// flatten(list) === [1, 2, 3, 4, 5]

/* ============= 从这里开始写代码 ============== */
// 需返回结果数组

function isArrary(x) {
  return x.constructor === Array
}

function flatten(arr) {
  if (!isArrary(arr)) return arr
  const reuslt = []
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]

    if (isArrary(current)) {
      reuslt.push(...flatten(current))
    } else {
      reuslt.push(current)
    }
  }
  return reuslt
}

const r = flatten(list)

console.log(r)
/* ================ 到这里结束 ================ */
