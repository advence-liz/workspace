/*
 * @lc app=leetcode.cn id=90 lang=javascript
 *
 * [90] 子集 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 *
 *     1     2   \2
 *   2  \2  2
 * 2
 */
var subsetsWithDup = function(nums) {
    let res = [[]]

    function dsf(nums, paths, index) {
        if (paths.length) {
            res.push(paths.slice())
        }
        for (let i = index; i < nums.length; i++) {
            if (i > index && nums[i] === nums[i - 1]) continue
            paths.push(nums[i])
            dsf(nums, paths, i + 1)
            paths.pop()
        }
    }
    dsf(
        nums.sort((a, b) => a - b),
        [],
        0
    )
    return res
}
// @lc code=end
