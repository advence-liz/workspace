/*
 * @lc app=leetcode.cn id=455 lang=javascript
 *
 * [455] 分发饼干
 */

// @lc code=start
/**
 * @param {number[]} g
 * @param {number[]} s
 * @return {number}
 *
 *  g = [1,2,3]
 *  s = [1,1]
 *
 */
var findContentChildren = function(g, s) {
  g.sort((a, b) => a - b)
  s.sort((a, b) => a - b)
  let index = 0
  let ans = 0
  for (let i = 0; i < s.length; i++) {
    if (index < g.length && s[i] >= g[index]) {
      index++
      ans++
    }
  }
  return ans
}
// @lc code=end
