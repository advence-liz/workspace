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

const binarySearch = (arr = [], key, low, height) => {
    const mid = parseInt((low + height) / 2)
    if (arr[low] > key || arr[height] < key) return -1

    if (arr[mid] > key) return binarySearch(arr, key, low, mid)
    else if (arr[mid] < key) return binarySearch(arr, key, mid, height)
    else return mid
}
console.log(binarySearch(arr, 7, 0, arr.length))

// 下面的写法会导致index 丢失已经是一个新数组了囧
// function binarySearch (arr = [], key) {
//   const len = arr.length
//   const mid = parseInt(len / 2)
//   if (key === arr[mid]) return mid
//   else if (key < arr[mid]) return binarySearch(arr.slice(0, mid), key)
//   else if (key > arr[mid]) return binarySearch(arr.slice(mid + 1), key)
//   // else return -1
// }

// console.log(binarySearch(arr, 7))
