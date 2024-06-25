/*
 * @lc app=leetcode.cn id=39 lang=javascript
 *
 * [39] 组合总和
 */

// @lc code=start
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    var res = []

    function backtrack(nums = [], paths, target, index) {
        if (target < 0) {
            return
        }
        if (target === 0) {
            res.push([...paths])
            return
        }
        for (let i = index; i < nums.length; i++) {
            if (nums[i] <= target) {
                paths.push(nums[i])
                backtrack(nums, paths, target - nums[i], i)
                paths.pop()
            }
        }
    }
    backtrack(candidates, [], target, 0)
    return res
}
// var r = combinationSum([2, 3, 6, 7], 7)
// @lc code=end
