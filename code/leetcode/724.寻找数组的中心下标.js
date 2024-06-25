/*
 * @lc app=leetcode.cn id=724 lang=javascript
 *
 * [724] 寻找数组的中心下标
 *
 * https://leetcode-cn.com/problems/find-pivot-index/description/
 *
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */

var pivotIndex = function(nums) {
  var preSum = [0]
  for (var i = 0; i < nums.length; i++) {
    preSum[i + 1] = preSum[i] + nums[i]
  }
  // [#,0~0,0~1,0~2,0~i-1]
  // [0,1,8,11,17,22,28]
  for (var j = 0; j < nums.length; j++) {
    // 0~j-1   0~n-1 - 0~j
    if (preSum[j] === preSum[nums.length] - preSum[j + 1]) {
      return j
    }
  }
  return -1
}
// @lc code=end
