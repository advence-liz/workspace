/*
 * @lc app=leetcode.cn id=55 lang=javascript
 *
 * [55] 跳跃游戏
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canJump = function(nums) {
    if (!nums.length) return

    let pos = nums.length - 1

    for (let i = nums.length - 2; i >= 0; i--) {
        if (nums[i]+1 >= pos) {
            pos = i
        }
    }
    return pos === 0
}
// @lc code=end
