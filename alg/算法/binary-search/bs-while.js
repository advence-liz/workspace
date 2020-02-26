console.log(module.i)
const assert = require('assert').strict
const arr = [1, 2, 3, 4, 5, 6, 7, 8]

function binarySearch (arr = [], key) {
    if (!arr.length) return -1
    let low = arr[0]
    let height = arr[arr.length - 1]

    while (low < height) {
        let mid = parseInt((low + height) / 2)

        if (arr[mid] === key) return mid
        if (arr[mid] < key) {
            low = mid
        }
        if (arr[mid] > key) {
            height = mid
        }
    }

    return -1
}

const re = binarySearch(arr, 7)
assert.equal(re, 6, 'equal')
