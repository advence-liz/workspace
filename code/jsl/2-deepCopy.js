// https://juejin.cn/post/6844903621444763661  for in  Object.keys for of

function deepCopy(obj) {
    if (typeof obj !== 'object') {
        return obj
    }

    let subObj = Array.isArray(obj) ? [] : {}

    for (let key of Object.keys(obj)) {
        subObj[key] = deepCopy(obj[key])
    }
    return subObj
}
var c = { liz: 'eee', v: { v: 1, c: { v: 1 } } }
var r = deepCopy(c)
console.log(r, c === r)
