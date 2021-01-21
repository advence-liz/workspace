/*
 * @lc app=leetcode.cn id=121 lang=javascript
 *
 * [121] 买卖股票的最佳时机
 */

// @lc code=start
/**
 * @param {number[]} prices
 * @return {number}
 */
// 输入: [7,1,5,3,6,4]
// 输出: 5
// 解释: 在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
//      注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。

var maxProfit = function(prices) {
  var min = Infinity
  var max = 0

  for (var i = 0; i < prices.length; i++) {
    var cur = prices[i]
    if (cur < min) {
      min = cur
    } else {
      max = Math.max(max, cur - min)
    }
  }
  return max
}
// var maxProfit = function(prices) {
//     var max = 0
//     for (var i = 0; i < prices.length-1; i++) {
//       var cur = prices[i]

//       for (var j = i + 1; j < prices.length; j++) {
//         var val = prices[j] - cur
//         max = Math.max(max, val)
//       }
//     }
//     return max
//   }
// @lc code=end
