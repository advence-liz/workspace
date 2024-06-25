/*
 * @lc app=leetcode.cn id=746 lang=javascript
 *
 * [746] 使用最小花费爬楼梯
 */

// @lc code=start
/**
 * @param {number[]} cost
 * @return {number}
 */
//  确定dp数组（dp table）以及下标的含义
//  确定递推公式
//  dp数组如何初始化
//  确定遍历顺序
//  举例推导dp数组

var minCostClimbingStairs = function(cost) {
  var dp = []
  dp[0] = cost[0]
  dp[1] = cost[1]

  for (let i = 2; i < cost.length; i++) {
    dp[i] = Math.min(dp[i - 1], dp[i - 2]) + cost[i]
  }
  return Math.min(dp[cost.length - 1], dp[cost.length - 2])
}
// @lc code=end
