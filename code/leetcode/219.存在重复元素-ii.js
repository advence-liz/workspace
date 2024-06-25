/*
 * @lc app=leetcode.cn id=219 lang=javascript
 *
 * [219] 存在重复元素 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var containsNearbyDuplicate = function(nums, k) {
    // key nums[i] val i
    let m = new Map()
    for (let i = 0; i < nums.length; i++) {
        if (m.has(nums[i]) && Math.abs(i - m.get(nums[i])) <= k) {
            return true
        }
        m.set(nums[i], i)
    }
    return false
}
// @lc code=end
