console.log(module.i)
const arr = [1, 2, 3, 4, 5, 6, 7, 8]

const binarySearch = (arr = [], key, low, height) => {
  const mid = parseInt((low + height) / 2)
  if (arr[low] > key || arr[height] < key) return -1

  if (arr[mid] > key) return binarySearch(arr, key, low, mid)
  else if (arr[mid] < key) return binarySearch(arr, key, mid, height)
  else return mid
}

console.log(binarySearch(arr, 7, 0, arr.length))
