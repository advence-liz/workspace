/*
 * @lc app=leetcode.cn id=5 lang=javascript
 *
 * [5] 最长回文子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string}
 *  if( s[i] === s[j] && dp[i+1][j-1]) {
 *  dp[i][j] = true
 * }
 */
var longestPalindrome = function(s) {
  if (!s || !s.length) {
    return ''
  }
  let dp = []
  let res = s[0]
  for (let i = s.length - 1; i >= 0; i--) {
    dp[i] = []
    for (let j = i; j < s.length; j++) {
      let diff = j - i
      if (diff === 0) {
        dp[i][j] = true
      } else if (diff === 1 && s[i] === s[j]) {
        dp[i][j] = true
      } else if (s[i] === s[j] && dp[i + 1][j - 1]) {
        dp[i][j] = true
      }

      if (dp[i][j] && j - i + 1 > res.length) {
        res = s.slice(i, j + 1)
      }
    }
  }
  return res
}
// @lc code=end
