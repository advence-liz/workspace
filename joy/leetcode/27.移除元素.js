/*
 * @lc app=leetcode.cn id=27 lang=javascript
 *
 * [27] 移除元素
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 * 快慢指针
 */
var removeElement = function(nums, val) {
  let slow = 0
  let fast = 0
  for (; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow] = nums[fast]
      slow++
    }
  }
  return slow
}
// @lc code=end
