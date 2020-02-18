console.log(module.i)
const assert = require('assert').strict
const arr = [1, 2, 3, 4, 5, 6, 7, 8]

function binarySearch (arr = [], key, low, height) {
  if (!arr.length) return -1
  let mid = parseInt((low + height) / 2)
  if (arr[mid] === key) return mid
  if (arr[mid] < key) return binarySearch(arr, key, mid, height)
  if (arr[mid] > key) return binarySearch(arr, key, low, mid)
}
const re = binarySearch(arr, 3, 0, 7)
