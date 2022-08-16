/*
 * @lc app=leetcode.cn id=136 lang=javascript
 *
 * [136] 只出现一次的数字
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 * https://leetcode.cn/problems/single-number/solution/zhi-chu-xian-yi-ci-de-shu-zi-by-leetcode-solution/
 */
var singleNumber = function(nums) {
    let res = 0

    for (let n of nums) {
        res = res ^ n
    }

    return res
}
// @lc code=end
