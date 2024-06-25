/*
 * @lc app=leetcode.cn id=56 lang=javascript
 *
 * [56] 合并区间
 */

// @lc code=start
/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
  intervals.sort((a, b) => {
    return a[0] - b[0]
  })
  let merged = []
  for (let i = 0; i < intervals.length; i++) {
    let [left, right] = intervals[i]
    if (merged.length === 0 || merged[merged.length - 1][1] < left) {
      merged.push(intervals[i])
    } else {
      merged[merged.length - 1][1] = Math.max(
        right,
        merged[merged.length - 1][1]
      )
    }
  }
  return merged
}
// @lc code=end
