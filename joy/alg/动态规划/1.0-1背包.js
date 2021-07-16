/**
 *
 * @param {number[]} weight 商品重量数组 [1,3,4]
 * @param {number[]} value 商品价值数组 [15,20,30]
 * @param {number[]} size 背包大小 4
 *   0 1 2 3 4
 * 0 0 0 0 0 0
 * 1
 * 2
 */
function WeightBagProblem(weight = [1, 3, 4], value = [15, 20, 30], size = 4) {
  var dp = []
  for (let i = 0; i < weight.length; i++) {
    dp[i] = new Array(size + 1).fill(0)
  }
  for (let j = weight[0]; j <= size; j++) {
    dp[0][j] = weight[0]
  }
  for (let i = 1; i < weight.length; i++) {
    for (let j = 0; j <= size; j++) {
      if (j < weight[i]) dp[i][j] = dp[i - 1][j]
      else {
        dp[i][j] = Math.max(dp[i - i][j], dp[i - i][j - weight[i]] + value[i])
      }
      console.log(dp)
    }
  }
  return dp[weight.length - 1][size]
}
var r = WeightBagProblem()

console.log(r)
