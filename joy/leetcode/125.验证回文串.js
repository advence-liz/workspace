/*
 * @lc app=leetcode.cn id=125 lang=javascript
 *
 * [125] 验证回文串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 * 输入: "A man, a plan, a canal: Panama"
 * 输出: true
 * aba
 * 012
 * abba
 * 0123
 * mid = 2
 * 特殊 case 未过 "ab_a"
 * \w [a-zA-Z_0-9]
 */
var isPalindrome = function(s) {
  if (!s) return true
  //  var str = s.replace(/[^\w\d]/g, '')
  var str = s.replace(/[^a-zA-Z0-9]/g, '')
  str = str.toLowerCase()
  var len = str.length
  var last = len - 1
  var mid = Math.floor(len / 2)

  for (var i = 0; i < mid; i++) {
    if (str.charAt(i) !== str.charAt(last - i)) return false
  }
  return true
}
// @lc code=end
