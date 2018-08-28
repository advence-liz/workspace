console.log('_demo')
function exchange (arr, i, j) {
  let tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}
function bubbleSort (arr = [3, 4, 5, 1, 0]) {
  let n = arr.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        exchange(arr, j, j + 1)
      }
    }
  }
  console.log(arr)
}
bubbleSort()
