/*
 * @lc app=leetcode.cn id=344 lang=javascript
 *
 * [344] 反转字符串
 */

// @lc code=start
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 * hello 5   2
 * oellh
 * olleh
 */
var reverseString = function(s) {
  let len = s.length
  let mid = Math.floor(len / 2)
  for (let i = 0; i < mid; i++) {
    let tmp = s[i]
    s[i] = s[len - 1 - i]
    s[len - 1 - i] = tmp
  }
  return s
}

// reverseString(['h', 'e', 'l', 'l', 'o'])
// @lc code=end
