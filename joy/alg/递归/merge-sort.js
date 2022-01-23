function mergeSort(arr, left, right) {
  var mid = left + (right - left) / 2

  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  merge(arr, left, right, mid)

  function merge(arr, left, mid, right) {
    var p1 = left
    var p2 = mid + 1

    var res = []

    while (p1 <= mid && p2 <= right) {
      let v1 = arr[p1]
      let v2 = arr[p2]

      if (v1 < v2) {
        res.push(v1)
        p1++
      }

      if (v1 > v2) {
        res.push(v2)
        p2++
      }
    }

    for (let i = p1; p1 <= mid; i++) {
      res.push(arr[i])
    }

    for (let j = p2; p2 <= right; j++) {
      res.push(arr[j])
    }
  }
}

function merge(arr, left, mid, right) {
  var p1 = left
  var p2 = mid + 1

  var res = []

  while (p1 <= mid && p2 <= right) {
    let v1 = arr[p1]
    let v2 = arr[p2]

    if (v1 < v2) {
      res.push(v1)
      p1++
    }

    if (v1 > v2) {
      res.push(v2)
      p2++
    }
  }

  while (p1 <= mid) {
    res.push(arr[p1])
    p1++
  }
  while (p2 <= right) {
    res.push(arr[p2])
    p2++
  }

  return res
}
var arr = [1, 3, 5, 2, 4, 6]

var r = merge(arr, 0, 2, 5)
console.log(r)
