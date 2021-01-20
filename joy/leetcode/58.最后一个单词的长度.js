/*
 * @lc app=leetcode.cn id=58 lang=javascript
 *
 * [58] 最后一个单词的长度
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 * abc def
 */
var lengthOfLastWord = function(s) {
  var last = s.length - 1
  var done = false
  var str = ''

  while (s.charAt(last) === ' ') {
    last--
  }

  while (!done) {
    var char = s.charAt(last)

    if (char === ' ' || last < 0) {
      done = true
    } else {
      str = str + char
    }
    last--
  }
  return str.length ? str.length : 0
}

// lengthOfLastWord('Hello World')
// lengthOfLastWord('a a     ')

// @lc code=end
