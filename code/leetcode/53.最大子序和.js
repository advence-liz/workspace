/*
 * @lc app=leetcode.cn id=53 lang=javascript
 *
 * [53] 最大子序和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {

    let max = nums[0] // max 赋 0 当数组中全部为负值就挂了 -Infinity
    let sum = 0

    for(let i=0;i<nums.length;i++){
        sum+=nums[i]
        max = Math.max(sum,max)
        if(sum <0){
            sum =0
        }

    }
    return max

};
// @lc code=end