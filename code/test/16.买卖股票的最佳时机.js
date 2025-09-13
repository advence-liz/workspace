// 如果能盈利折线图，一定有上升趋势

var maxProfit = function(prices) {
  var min = prices[0]
  var max = 0

  for (let i = 1; i < prices.length; i++) {
    // 上升趋势更新最大收益
    // 下降趋势更新最小值
    if (prices[i] > prices[i - 1]) {
      max = Math.max(max, prices[i] - min)
    } else {
      min = Math.min(min, prices[i])
    }
  }
}
