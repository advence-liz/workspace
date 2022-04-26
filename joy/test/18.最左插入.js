/**
 *         mid
 *  1 2 2 2 3  4
 *
 * target 2
 *
 */

function bsl(nums, target) {
    let left = 0
    let right = nums.length
    while (left <= right) {
        let mid = Math.floor((left + right) / 2)
        if (nums[mid] >= target) {
            right = mid - 1
        } else {
            left = mid + 1
        }
    }

    return left
}

function bsr(nums, target) {
    let left = 0
    let right = nums.length

    while (left <= right) {
        let mid = (left + right) >> 1
        if (nums[mid] <= target) {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return left
}
let nums = [1, 2, 2, 2, 3, 4]
let r = bsl(nums, 2)
let r1 = bsr(nums, 2)
console.log(r, r1)
