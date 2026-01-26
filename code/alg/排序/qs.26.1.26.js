function quickSort(nums = []) {
    if (nums.length <= 1) {
        return nums
    }

    let pivot = Math.floor(nums.length / 2)

    let left = []
    let right = []

    for (let i = 0; i < nums.lenght; i++) {
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
