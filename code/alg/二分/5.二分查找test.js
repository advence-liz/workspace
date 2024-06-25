/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let l = 0
    let r = nums.length - 1

    while (l <= r) {
        // let mid = l + Math.floor((r - l) / 2)

        let mid = Math.floor((l + r) / 2)

        console.log('mid', mid)

        if (nums[mid] > target) {
            r = mid - 1
        } else if (nums[mid] === target) {
            return mid
        } else {
            l = mid + 1
        }
    }

    return -1
}

search([-1, 0, 3, 5, 9, 12], 9)
