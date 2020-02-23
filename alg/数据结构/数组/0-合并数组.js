console.log(module.i)
const m = [1, 2, 5]
const n = [3, 4, 6, 7]

function merge(m, n) {
    let arr = []
    while (m.length && n.length) {
        if (m[0] < n[0]) arr.push(m.shift())
        else arr.push(n.shift())
    }
    if (m.length) arr.push(...m)
    if (n.length) arr.push(...n)
    console.log(arr)
}

merge(m, n)
