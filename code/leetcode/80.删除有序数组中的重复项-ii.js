/*
 * @lc app=leetcode.cn id=80 lang=javascript
 *
 * [80] 删除有序数组中的重复项 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    let slow = 2 // 写
    let fast = 2 // 读
    let k = 2

    for (; fast < nums.length; fast++) {
        if (nums[fast] !== nums[slow - k]) {
            nums[slow] = nums[fast]
            slow++
        }
    }
    return slow
}
// @lc code=end
