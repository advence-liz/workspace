/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
  let res = []
  function dsf(nums, track) {
    if (track.length === nums.length) {
      return res.push([...track])
    }
    for (let i = 0; i < nums.length; i++) {
      if (track.includes(nums[i])) continue
      track.push(nums[i])
      dsf(nums, track)
      track.pop()
    }
  }
  dsf(nums, [])
  return res
}
// let r = permute([1, 2, 3])
// console.log(r)
// @lc code=end
