/*
 * @lc app=leetcode.cn id=665 lang=javascript
 *
 * [665] 非递减数列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var checkPossibility = function(nums) {
    /**
     * if nums[i] > nums[i+1]
     *
     *    nums[i] = nums[i+1]  // nums[i+1] >= nums[i-1]
     */
    let count = nums[0] > nums[1] ? 1 : 0

    for (let i = 1; i < nums.length - 1; i++) {
        if (nums[i] > nums[i + 1]) {
            if (nums[i + 1] >= nums[i - 1]) {
                nums[i] = nums[i + 1]
            } else {
                nums[i + 1] = nums[i]
            }

            if (count === 1) return false
            count++
        }
    }
    return true
}

// checkPossibility([4, 2, 3])
// @lc code=end
