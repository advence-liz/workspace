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
 *
 * 输入：nums = [2,3,2,2,3], val = 3
 * 输出：2, nums = [2,2]
 * 快慢指针
 * 线索为快指针，快指针遍历数据组
 * 慢指针为非移除元素子数组的结尾
 */
var removeElement = function(nums, val) {
  var slow = 0
  var fast = 0
  for (; fast < nums.length; fast++) {
    if (nums[fast] !== val) {
      nums[slow] = nums[fast]
      slow++
    }
  }
  return slow
}
// @lc code=end
