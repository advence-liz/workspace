console.log(module.i)
const m = [1, 2, 5]
const n = [3, 4, 6, 7]

function merge (m, n) {
  let arr = []
  let i = 0
  let j = 0
  while (i < m.length && j < n.length) {
    if (m[i] < n[j]) {
      arr.push(m[i])
      i++
    } else {
      arr.push(n[j])
      j++
    }
    while (i < m.length) {
      arr.push(m[i])
      i++
    }
    while (j < n.length) {
      arr.push(n[j])
      j++
    }
  }
  //   if (m.length) arr.push(...m)
  //   if (n.length) arr.push(...n)
  console.log(arr)
}
merge(m, n)
