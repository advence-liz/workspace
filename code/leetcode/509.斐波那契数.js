/*
 * @lc app=leetcode.cn id=509 lang=javascript
 *
 * [509] 斐波那契数
 */

// @lc code=start
/**
 * @param {number} n
 * @return {number}
 *  1.确定dp数组（dp table）以及下标的含义
 *  2.确定递推公式
 *  3.dp数组如何初始化
 *  4.确定遍历顺序
 *  5.举例推导dp数组
 */

// var fib = function(n) {
//   let dp = []
//   //   F(n)= F(n-1) + F(n-2)
//   dp[0] = 0
//   dp[1] = 1
//   if (n < 2) {
//     return dp[n]
//   }
//   for (let i = 2; i <= n; i++) {
//     dp[i] = dp[i - 1] + dp[i - 2]
//   }
//   console.log(dp)
//   return dp[n]
// }
var fib = function(n) {
  let dp = []
  //   F(n)= F(n-1) + F(n-2)
  dp[0] = 0
  dp[1] = 1
  //   if (n < 2) {
  //     return dp[n]
  //   }
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[1] + dp[0]
    dp[0] = dp[1]
    dp[1] = dp[i]
  }
  //   console.log(dp)
  return dp[n]
}
// fib(7)
// @lc code=end
