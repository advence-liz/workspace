console.log(module.i)
const arr = [8, 4, 5, 7, 1, 3, 6, 2]
const quickSort = function (arr) {
  const len = arr.length
  if (len < 2) {
    return arr
  }

  var pivot = arr[parseInt(len / 2)]

  var left = []

  var right = []

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i])
    } else if (arr[i] > pivot) {
      right.push(arr[i])
    }
  }

  return quickSort(left).concat([pivot], quickSort(right))
}
console.log(quickSort(arr))
