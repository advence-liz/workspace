function quickSort_c(arr, low, r) {
    if (low >= r) return
    let q = partition(arr, low, r)
    quickSort_c(arr, low, q - 1)
    quickSort_c(arr, q + 1, r)
}

function partition(arr, low, high) {
    // pivot
    let pivot = arr[high]

    // Index of smaller element and
    // indicates the right position
    // of pivot found so far
    let i = low

    for (let j = low; j <= high - 1; j++) {
        // If current element is smaller
        // than the pivot
        if (arr[j] < pivot) {
            swap(arr, i, j)
            i++
        }
    }
    swap(arr, i, high)
    return i
}

function swap(arr, i, r) {
    let temp = arr[i]
    arr[i] = arr[r]
    arr[r] = temp
}

function quickSort(arr) {
    quickSort_c(arr, 0, arr.length - 1)
}

var s = [32, 12, 56, 78, 76, 45, 36]
quickSort(s)
console.log(s)
