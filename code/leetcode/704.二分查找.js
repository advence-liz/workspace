/*
 * @lc app=leetcode.cn id=704 lang=javascript
 *
 * [704] 二分查找
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * nums = [-1,0,3,5,9,12], target = 9
 */
var search = function(nums, target) {
  var l = 0
  var r = nums.length - 1

  while (l < r) {
    var mid = ~~((l + r) / 2)

    if (nums[mid] === target) return mid

    if (nums[mid] > target) {
      r = mid
    } else {
      l = mid
    }
  }
  return -1
}
// @lc code=end
