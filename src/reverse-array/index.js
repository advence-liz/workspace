console.log('_demo')
function reverseArray (arr = []) {
  for (let i = 0, len = arr.length; i < Math.floor(len / 2); i++) {
    let tmp = arr[i]
    arr[i] = arr[len - 1 - i]
    arr[len - 1 - i] = tmp
  }
  console.log(arr)
}
reverseArray([1, 2])

reverseArray([1, 2, 3])
reverseArray([1, 2, 3, 4, 5, 6, 7])
