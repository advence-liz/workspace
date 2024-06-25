/*
 * @lc app=leetcode.cn id=53 lang=javascript
 *
 * [53] 最大子数组和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 * dp[i] = max(dp[i - 1] + nums[i], nums[i])
 */
var maxSubArray = function(nums) {
  var dp = [nums[0]]
  var max = nums[0]
  for (let i = 1; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1] + nums[i], nums[i])
    max = Math.max(dp[i], max)
  }

  return max

  //   var len = nums.length
  //   var sum = 0
  //   var max = -Infinity
  //   for (let i = 0; i < len; i++) {
  //     sum = 0
  //     for (let j = i; j < len; j++) {
  //       sum = sum + nums[j]
  //       max = Math.max(max, sum)
  //     }
  //   }
  //   return max
}
// @lc code=end
