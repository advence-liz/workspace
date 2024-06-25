/*
 * @lc app=leetcode.cn id=278 lang=javascript
 *
 * [278] 第一个错误的版本
 */

// @lc code=start
/**
 * Definition for isBadVersion()
 *
 * @param {integer} version number
 * @return {boolean} whether the version is bad
 * isBadVersion = function(version) {
 *     ...
 * };
 */

/**
 * @param {function} isBadVersion()
 * @return {function}
 */
var solution = function(isBadVersion) {
  /**
   * @param {integer} n Total versions
   * @return {integer} The first bad version
   */
  return function(n) {
    let start = 0
    let end = n

    while (start < end) {
      let mid = start + Math.floor((end - start) / 2)

      if (!isBadVersion(mid)) {
        start = mid + 1
      } else {
        end = mid
      }
    }
    return start
  }
}
// @lc code=end
