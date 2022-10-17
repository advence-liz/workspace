/*
 * @lc app=leetcode.cn id=198 lang=javascript
 *
 * [198] 打家劫舍
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 *
 *  [1,2,3,1]
 *dp[0]
 *
 * dp[0] = nums [0]
 * dp[1] = max(nums[0],nums[1])
 * 前 n 个房子的最大收益 （n 从 0 开始）
 * dp[n] = max(dp[n-1],dp[n-2]+nums[n])
 *
 * n 从 1 开始
 * dp[0] = 0
 * dp[1] = nums[1]
 * dp[n] = max(dp[n-1],dp[n-2]+ nums[n-1]))
 */
var rob = function(nums) {
    let dp = new Array(nums.length)
    dp[0] = nums[0]
    dp[1] = Math.max(nums[0], nums[1])

    for (let k = 2; k < nums.length; k++) {
        dp[k] = Math.max(dp[k - 1], dp[k - 2] + nums[k])
    }
    return dp[nums.length - 1]
}
// @lc code=end
