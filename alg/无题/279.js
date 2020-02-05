/**
 * @param {number} n
 * @return {number}
 */
var numSquares = function (n) {
  var dp = new Array(n + 1) // 默认初始化值都为0
  for (var i = 1; i <= n; i++) {
    dp[i] = i // 最坏的情况就是每次+1
    for (var j = 1; i - j * j >= 0; j++) {
      dp[i] = Math.min(dp[i], dp[i - j * j] + 1) // 动态转移方程
    }
  }
  return dp[n]
}

console.log( numSquares(12))