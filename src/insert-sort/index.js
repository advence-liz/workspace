console.log(module.i)
function exchange (arr, i, j) {
  let tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}
function sort (arr = [6, 7, 3, 4, 1, 5, 2]) {
  const N = arr.length

  for (let i = 1; i < N; i++) {
    for (let j = i; j > 0 && arr[j] < arr[j - 1]; j--) {
      exchange(arr, j, j - 1)
      //   if (arr[j] < arr[j - 1]) exchange(arr, j, j - 1)
    }
  }
  console.log(arr)
}
sort()
