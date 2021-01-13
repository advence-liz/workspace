/*
 * @lc app=leetcode.cn id=165 lang=javascript
 *
 * [165] 比较版本号
 */

// @lc code=start
/**
 * @param {string} version1
 * @param {string} version2
 * @return {number}
 * 1.1.1  1.1
 * 1 1 1
 * 1 1
 */
var compareVersion = function(version1, version2) {
  var v1 = version1.split('.')
  var v2 = version2.split('.')

  var index = 0
  while (index < Math.max(v1.length, v2.length)) {
    var n1 = ~~v1[index]
    var n2 = ~~v2[index]
    if (n1 < n2) return -1
    else if (n1 > n2) return 1
    else {
      index++
    }
  }
  return 0
}
// @lc code=end
