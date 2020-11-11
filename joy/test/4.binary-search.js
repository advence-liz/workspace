// 在计算机科学中，二分查找算法（英语：binary search algorithm），
// 也称折半搜索算法（英语：half-interval search algorithm）[1]、
// 对数搜索算法（英语：logarithmic search algorithm）[2]，是一种在有序数组中查找某一特定元素的搜索算法。
// 搜索过程从数组的中间元素开始，如果中间元素正好是要查找的元素，则搜索过程结束；如果某一特定元素大于或者小于中间元素，
// 则在数组大于或小于中间元素的那一半中查找，而且跟开始一样从中间元素开始比较。如果在某一步骤数组为空，
// 则代表找不到。这种搜索算法每一次比较都使搜索范围缩小一半。

var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function binarySearch(arr = [], key, low, height) {
    let mid = parseInt((low + height) / 2)

    if (arr[mid] === key) return mid

    if (arr[mid] > key) return binarySearch(arr, key, low, mid)

    if (arr[mid] < key) return binarySearch(arr, key, mid, height)
    return -1
}

var r = binarySearch(arr, 9, 0, arr.length)
console.log(r)