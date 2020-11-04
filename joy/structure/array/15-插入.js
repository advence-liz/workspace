/**
 * 12345
 * 123455
 * 123445
 * 123345
 */
const arr = [1, 2, 3, 4, 5]

function insert(arr = [], index, val) {
  const len = arr.length
  if (!len) return -1
  for (let i = len - 1; i >= index; i--) {
    arr[i + 1] = arr[i]
  }
  console.log(arr)
  arr[index] = val
  console.log(arr)
  return arr
}
insert(arr, 2, 'o^*')
