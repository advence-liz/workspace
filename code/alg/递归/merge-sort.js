function mergeSort(arr, left, right) {
  var mid = left + Math.floor((right - left) / 2)
  if (left === right) return
  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  merge(arr, left, mid, right)

  function merge(arr, left, mid, right) {
    var p1 = left
    var p2 = mid + 1
    var k = left

    while (p1 <= mid && p2 <= right) {
      let v1 = arr[p1]
      let v2 = arr[p2]

      if (v1 < v2) {
        arr[k] = v1
        k++
        p1++
      }

      if (v1 > v2) {
        arr[k] = v2
        k++
        p2++
      }
    }

    for (let i = p1; p1 <= mid; i++) {
      arr[k] = arr[i]
      k++
    }

    for (let j = p2; p2 <= right; j++) {
      arr[k] = arr[j]
      k++
    }
  }
  //   return arr
}

function merge(arr, left, mid, right) {
  var p1 = left
  var p2 = mid + 1
  var k = left
  //  TODO 修改为正确方式
  while (p1 <= mid && p2 <= right) {
    let v1 = arr[p1]
    let v2 = arr[p2]

    if (v1 < v2) {
      arr[k] = v1
      k++
      p1++
    }

    if (v1 > v2) {
      arr[k] = v2
      k++
      p2++
    }
  }

  for (let i = p1; p1 <= mid; i++) {
    arr[k] = arr[i]
    k++
  }

  for (let j = p2; p2 <= right; j++) {
    arr[k] = arr[j]
    k++
  }
}
var arr = [1, 3, 5, 2, 4, 6]

// 123

merge(arr, 0, 2, 5)
console.log(arr)

// var r = mergeSort(arr, 0, arr.length)
// console.log(r)
