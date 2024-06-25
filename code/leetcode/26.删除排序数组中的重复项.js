/*
 * @lc app=leetcode.cn id=26 lang=javascript
 *
 * [26] 删除排序数组中的重复项
 */

// @lc code=start
/**
 * @param {number[]} nums 已经进行排序的数组
 * @return {number}
 * 快慢指针
 * p 已经去重的索引
 * p  q
 * [1,1,2,2,3]
 *  p   q
 *  1,1,2,2,3
 *    p     q
 *  1,2,2,2,3
 */
var removeDuplicates = function(nums) {
  var p = 0
  var q = 1

  while (q < nums.length) {
    if (nums[p] != nums[q]) {
      nums[p + 1] = nums[q]
      p++
      q++
    } else {
      q++
    }
  }
  return p + 1
}
// removeDuplicates([1, 1, 2])
// @lc code=end
