console.log('_demo')
function exchange (arr, i, j) {
  let tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}
function selectSort (arr = [3, 4, 2, 1, 0]) {
  for (let i = 0, len = arr.length; i < len; i++) {
    let min = i
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j
    }
    exchange(arr, i, min)
  }

  console.log(arr)
}
selectSort()
