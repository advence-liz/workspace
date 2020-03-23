function partition(arr, left, right) {
    let pivot = arr[right]
    let index = left
    for (let i = left; i < right; i++) {
        if (arr[i] < pivot) {
            swap(arr, i, index)
            index++
        }
    }
    swap(arr, right, index)
    return index
}

function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]]
}
function sort(arr = []) {
    function quickSort(arr, left, right) {
        if (left > right) return

        let poivtIndex = partition(arr, left, right)
        quickSort(arr, left, poivtIndex - 1)
        quickSort(arr, poivtIndex + 1, right)
    }
    quickSort(arr, 0, arr.length - 1)
    console.log(arr)
    return arr
}

sort([2, 1, 4, 3, 5, 6, 9])
