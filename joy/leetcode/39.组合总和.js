/*
 * @lc app=leetcode.cn id=39 lang=javascript
 *
 * [39] 组合总和
 */

// @lc code=start
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
  var res = []
  var track = []
  function dsf(nums = [], target, index) {
    if (target === 0) {
      res.push([...track])
      return
    }
    if (track.length === nums.length) {
      return
    }
    for (let i = index; i < nums.length; i++) {
      track.push(nums[i])
      dsf(nums, target - nums[i], i)
      track.pop()
    }
  }
  dsf(candidates, target, 0)
  return res
}
// var r = combinationSum([2, 3, 6, 7], 7)
// @lc code=end
