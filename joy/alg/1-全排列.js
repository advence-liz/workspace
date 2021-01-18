/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 *        a
 *     1  2   3
 *     a
 *  1  2  3
 */
var permute = function(nums) {
  let res = []
  function backTrack(nums = [], track = []) {
    if (track.length === nums.length) {
      res.push([...track])
      return
    }
    // 遍历子节点
    for (let n of nums) {
      if (track.includes(n)) continue
      track.push(n)
      backTrack(nums, track)
      track.pop()
    }
  }
  backTrack(nums, [])
  return res
}
let r = permute([1, 2, 3])
console.log(r)
// @lc code=end

function preOrder() {
  function dsf(node, track) {
    if (!node) return
    track.push(node.val)
  }
}
