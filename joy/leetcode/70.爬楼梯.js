/*
 * @lc app=leetcode.cn id=70 lang=javascript
 *
 * [70] 爬楼梯
 */

// @lc code=start
/**
 * @param {number} n
 * @return {number}
 * @description
 * f(n) = f(n-1) + f(n-2)
 * f(0) = 0
 * f(1)= 1
 * f(2) = 2
 * f(3) = 3 111 12 21
 * f(4) =  1111 121  211  112 22
 */

// var climbStairs = function(n) {
//   if (n === 0) return 0

//   if (n === 1) return 1

//   if (n === 2) return 2

//   return climbStairs(n - 1) + climbStairs(n-2)
// }

/**
 *
 * @param {*} n
 *  1.确定dp数组（dp table）以及下标的含义
 *  2.确定递推公式
 *  3.dp数组如何初始化
 *  4.确定遍历顺序
 *  5.举例推导dp数组
 * @returns
 */
var climbStairs = function(n) {
  var dp = []
  dp[1] = 1
  dp[2] = 2
  // f(n) = f(n-1) + f(n-2)

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[n]
}
// @lc code=end
