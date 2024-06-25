/*
 * @lc app=leetcode.cn id=118 lang=javascript
 *
 * [118] 杨辉三角
 */

// @lc code=start
/**
 * @param {number} numRows
 * @return {number[][]}
 * f(n) = f(n-1) + f(n)
 */
var generate = function(numRows) {
  var res = [[1]]
  for (var i = 1; i < numRows; i++) {
    var ans = []
    for (var j = 0; j <= i; j++) {
      var pre = j - 1 < 0 ? 0 : res[i - 1][j - 1]
      var next = j >= res[i - 1].length ? 0 : res[i - 1][j]
      ans[j] = pre + next
    }
    res.push(ans)
  }
  return res
}

// generate(5)
// @lc code=end
