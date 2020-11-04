function deepCopy(obj) {
    let res = null
    if (typeof obj === 'object') {
        res = obj.constructor === Array ? [] : {}

        for (let v in obj) {
            res[v] = typeof v === 'object' ? deepCopy(v) : obj[v]
        }
    } else {
        res = obj
    }

    return res
}
var c = { liz: 'eee', v: { v: 1, c: { v: 1 } } }
var r = deepCopy(c)
console.log(r, c === r)
