/**
 * @param {number[]} nums
 * @return {number}
 * @ref https://leetcode-cn.com/leetbook/read/array-and-string/yf47s/
 * 输入：
 * nums = [1, 7, 3, 6, 5, 6]
 *       0 1  8  11 17 22 28
 * 输出：3
 * 解释：
 * 索引 3 (nums[3] = 6) 的左侧数之和 (1 + 7 + 3 = 11)，与右侧数之和 (5 + 6 = 11) 相等。
 * 同时, 3 也是第一个符合要求的中心索引。
 *  s1 1 s2 8 s3 11 s4 17 s5 22 s6 28
 * length = n
 * 0. si = sn-si+1  1    28 -8
 * 1. s2 = s6 - s3
 * // preSum[i] 就是 nums[0..i-1]

 */
var pivotIndex = function(nums) {
  var sum = [0]
  for (var j = 0; j < nums.length; j++) {
    sum[j + 1] = sum[j] + nums[j]
  }
  var len = sum.length

  for (var i = 1; i < len; i++) {
    if (sum[i] === sum[len - i - 1]) {
      return i
    }
  }
}
pivotIndex([1, 7, 3, 6, 5, 6])
