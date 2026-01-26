function mergeSort(nums = []) {
    if (nums.length <= 1) {
        return nums
    }

    let mid = Math.floor(nums.length / 2)
    let left = nums.slice(0, mid)
    let right = nums.slice(mid)

    return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
    let res = []
    let i = 0
    let j = 0

    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            res.push(left[i])
            i++
        } else {
            res.push(right[j])
            j++
        }
    }

    while (i < left.length) {
        res.push(left[i])
        i++
    }
    while (j < right.length) {
        res.push(right[j])
        j++
    }
    return res
}
let arr = [2, 1, 4, 3]
arr = mergeSort(arr)
console.log(arr)
