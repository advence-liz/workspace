function bs(nums = [], target) {
    let left = 0
    let right = nums.length - 1

    while (left < right) {
        let mid = left + Math.floor((right - left) / 2)

        if (target < nums[mid]) {
            right = mid - 1
        } else if (target > nums[mid]) {
            left = mid + 1
        } else {
            return mid
        }
    }

    return -1
}

var r = bs([1, 2, 3, 4, 5], 3)

console.log(r)
