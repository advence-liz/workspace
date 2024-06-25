/*
 * @lc app=leetcode.cn id=151 lang=javascript
 *
 * [151] 翻转字符串里的单词
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string}
 * example good a
 * a good example
 */
var reverseWords = function(s) {
  var strs = s.trim().split(/\s+/)
  return strs.reverse().join(' ')
  // var
}

// reverseWords('the sky is blue')
// @lc code=end
