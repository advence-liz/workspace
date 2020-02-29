/*
 * @lc app=leetcode.cn id=912 lang=javascript
 *
 * [912] 排序数组
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArray = function(nums) {
    for(let i =0;i<nums.length;i++){
        for(let j =0;j<nums.length -i-1;j++){
            if(nums[j]>nums[j+1]) [nums[j],[nums[j+1]]]=[nums[j+1],[nums[j]]]
        }
    }
    // console.log(nums)
    return nums
}
// @lc code=end

