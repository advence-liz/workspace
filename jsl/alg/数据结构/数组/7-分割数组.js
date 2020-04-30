/**
 * @ref https://www.cnblogs.com/LIUYANZUO/p/5745306.html
 */
// var arr = [1, 2, 5, 6, 3]

function partition(arr, left, right) {
    let pivot = arr[right]
    let index = left // 可以交换位置，
    for (let i = left; i < right; i++) {
        if (arr[i] < pivot) {
            swap(arr, i, index)
            index++
        }
    }
    swap(arr, right, index)
    console.log(arr, index)
    return index
}

function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]]
}

var arr = [8, 4, 90, 8, 34, 67, 1, 26, 17]

partition(arr, 0, arr.length - 1)

// partition(arr, 0,arr.length-1)
