/*
 * @lc app=leetcode.cn id=560 lang=javascript
 *
 * [560] 和为K的子数组
 *
 * https://leetcode-cn.com/problems/subarray-sum-equals-k/description/
 *
 * algorithms
 * Medium (44.47%)
 * Likes:    904
 * Dislikes: 0
 * Total Accepted:    111.1K
 * Total Submissions: 249.9K
 * Testcase Example:  '[1,1,1]\n2'
 *
 * 给定一个整数数组和一个整数 k，你需要找到该数组中和为 k 的连续的子数组的个数。
 *
 * 示例 1 :
 *
 *
 * 输入:nums = [1,1,1], k = 2
 * 输出: 2 , [1,1] 与 [1,1] 为两种不同的情况。
 *
 *
 * 说明 :
 *
 *
 * 数组的长度为 [1, 20,000]。
 * 数组中元素的范围是 [-1000, 1000] ，且整数 k 的范围是 [-1e7, 1e7]。
 *
 *
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */

// function getDefault(m, key) {
//   return m.get(key) === undefined ? 0 : m.get(key)
// }
var subarraySum = function(nums, k) {
  var preSum = [0]
  var ans = 0
  var m = new Map()
  m.set(0, 1)

  for (var i = 0; i < nums.length; i++) {
    preSum[i + 1] = nums[i] + preSum[i]
    var sum0_i = preSum[i + 1]
    var sum0_j = sum0_i - k

    if (m.has(sum0_j)) {
      ans = ans + m.get(sum0_j)
    }
    if (m.has(sum0_i)) {
      m.set(sum0_i, m.get(sum0_i) + 1)
    } else {
      m.set(sum0_i, 1)
    }
  }
  return ans
}
// @lc code=end
