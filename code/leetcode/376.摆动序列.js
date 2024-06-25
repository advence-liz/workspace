/*
 * @lc app=leetcode.cn id=376 lang=javascript
 *
 * [376] 摆动序列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var wiggleMaxLength = function(nums) {
    if (nums.length <= 1) {
        return nums.length
    }

    let preDiff = 0
    let ans = 1 // 记录峰值个数，序列默认序列最右边有一个峰值
    for (let i = 0; i < nums.length - 1; i++) {
        let curDiff = nums[i + 1] - nums[i]
        if ((curDiff > 0 && preDiff <= 0) || (curDiff < 0 && preDiff >= 0)) {
            ans++
            preDiff = curDiff
        }
    }
    return ans
}
// @lc code=end
