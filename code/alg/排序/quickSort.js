function quickSort(nums = []) {
    let pivot = Math.floor(nums / 2)

    let left = []
    let right = []

    for (let i = 0; i < nums.length; i++) {
        if (i === pivot) {
            continue
        }

        if (nums[i] < nums[pivot]) {
            left.push(nums[i])
        } else {
            right.push(nums[i])
        }
    }
    return [quickSort(left), nums[pivot], quickSort(right)]
}

quickSort([1, 2, 2, 3, 5, 4])
