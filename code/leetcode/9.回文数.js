/*
 * @lc app=leetcode.cn id=9 lang=javascript
 *
 * [9] 回文数
 */

// @lc code=start
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
  var y = x
  var l = 0

  while (y > 1) {
    y = y / 10
    l++
  }
  var sum = 0
  var _x = x
  while (l > 0) {
    sum = (_x % 10) * Math.pow(10, l - 1) + sum
    _x = Math.floor(_x / 10)
    l--
  }
  return sum === x
}
isPalindrome(1)
// @lc code=end
