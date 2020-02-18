console.log(module.i)
const arr = [1, 2, 3, 4, 5, 6, 7, 8]

// const binarySearchWarp = arr =>
//   function binarySearch (key, low, height) {
//     const mid = parseInt((low + height) / 2)
//     if (arr[low] > key || arr[height] < key) return -1

//     if (arr[mid] > key) return binarySearch(key, low, mid)
//     else if (arr[mid] < key) return binarySearch(key, mid, height)
//     else return mid
//   }

// console.log(binarySearchWarp(arr)(7, 0, arr.length))

const binarySearch = (arr = [], key) => {
  let low = 0
  let height = arr.length - 1
  let mid = parseInt((low + height) / 2)

  if (key < arr[low] || key > arr[height] || low > height) {
    return -1
  }

  while (low <= height) {
    mid = (low + height) / 2
    if (arr[mid] > key) {
      // 比关键字大则关键字在左区域
      height = mid - 1
    } else if (arr[mid] < key) {
      // 比关键字小则关键字在右区域
      low = mid + 1
    } else {
      return mid
    }
  }

  return -1 // 最后仍然没有找到，则返回-1
}

console.log(binarySearch(arr, 7, 0, arr.length - 1))
