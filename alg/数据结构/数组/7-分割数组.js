/**
 * @ref https://www.cnblogs.com/LIUYANZUO/p/5745306.html
 */
var arr = [1, 2, 5, 6, 3]

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
partition(arr, 0, arr.length - 1)

function sort(arr) {
    function quickSort(arr, left, right) {
        if (left > right) return
        var poivtIndex = partition(arr, left, right)
        quickSort(arr, left, poivtIndex - 1)
        quickSort(arr, poivtIndex + 1, right)
    }
    quickSort(arr, 0, arr.length - 1)
    console.log(arr)
    return arr
}

sort([8, 4, 90, 8, 34, 67, 1, 26, 17])
