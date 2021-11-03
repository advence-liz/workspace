/*
 * @lc app=leetcode.cn id=541 lang=javascript
 *
 * [541] 反转字符串 II
 */

// @lc code=start
/**
 * @param {string} s
 * @param {number} k
 * @return {string}
 * i
 * 0
 * 4
 *
 * 012345
 * 11/2
 */
var reverseStr = function(s, k) {
  let strs = s.split('')
  let i = 0
  // i+ len
  while (i + 2 * k <= strs.length) {
    reverse(strs, i, i + k - 1)
    i = i + 2 * k
  }
  let diff = strs.length - i

  if (diff < k) {
    reverse(strs, i, strs.length - 1)
  } else {
    reverse(strs, i, i + k - 1)
  }

  function reverse(strs, left, right) {
    while (left < right) {
      let tmp = strs[left]
      strs[left] = strs[right]
      strs[right] = tmp
      left++
      right--
    }
    // let mid = start + Math.floor((end - start) / 2)
    // for (let i = start; i <= mid; i++) {
    //   let targetIndex = end - i + start
    //   console.log('swap', i, targetIndex)
    //   let tmp = strs[i]
    //   strs[i] = strs[targetIndex]
    //   strs[targetIndex] = tmp
    // }
  }

  return strs.join('')
}

// reverseStr('abcdef', 3)
// @lc code=end
