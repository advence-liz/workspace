/*
 * @lc app=leetcode.cn id=20 lang=javascript
 *
 * [20] 有效的括号
 */

// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 * {1{2{x}}}
 */
var isValid = function(s) {
  let left = ['(', '{', '[']
  let right = [')', '}', ']']
  let m = new Map()
  left.forEach(function(key, index) {
    m.set(key, right[index])
  })

  let stack = []
  for (let i = 0; i < s.length; i++) {
    let char = s[i]
    if (left.includes(char)) {
      stack.push(char)
    }
    if (right.includes(char)) {
      if (m.get(stack.pop()) !== char) {
        return false
      }
    }
  }

  return stack.length ? false: true
}
// @lc code=end
