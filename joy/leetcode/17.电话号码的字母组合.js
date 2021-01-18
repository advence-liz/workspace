/*
 * @lc app=leetcode.cn id=17 lang=javascript
 *
 * [17] 电话号码的字母组合
 * str="A"
 * code = str.charCodeAt(0)
 * str2 = String.fromCharCode(code)
 * a  b  c    2
 * 97 98 99
 * d  e   f  3
 * 100 101 102
 */

// @lc code=start
/**
 * @param {string} digits
 * @return {string[]}
 */

var charMap = {
  2: ['a', 'b', 'c'],
  3: ['d', 'e', 'f'],
  4: ['g', 'h', 'i'],
  5: ['j', 'k', 'l'],
  6: ['m', 'n', 'o'],
  7: ['p', 'q', 'r', 's'],
  8: ['t', 'u', 'v'],
  9: ['w', 'x', 'y', 'z']
}

function getChars(n) {
  return charMap[n]
}
var letterCombinations = function(digits) {
  if (!digits) return []
  if (digits.length === 1) {
    return getChars(digits.charAt(0))
  }
  var res = []
  function dsf(track = [], index) {
    if (index === digits.length) {
      return res.push(track.join(''))
    }
    var chars = getChars(digits.charAt(index))
    for (var i = 0; i < chars.length; i++) {
      var char = chars[i]
      track.push(char)
      dsf(track, index + 1)
      track.pop()
    }
  }

  dsf([], 0)

  return res
}
// var r = letterCombinations('5')
// console.log(r)
// @lc code=end
