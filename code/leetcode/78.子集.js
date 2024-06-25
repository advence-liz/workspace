/*
 * @lc app=leetcode.cn id=78 lang=javascript
 *
 * [78] 子集
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 *
 *     1   2   3
 *   2   3   3
 * 3
 */
var subsets = function(nums) {
    let res = [[]]
    function dsf(nums, paths, index) {
        if (paths.length) {
            res.push(paths.slice())
        }

        for (let i = index; i < nums.length; i++) {
            paths.push(nums[i])
            // console.log(paths)
            dsf(nums, paths, i + 1)
            paths.pop()
        }
    }
    dsf(nums, [], 0)
    return res
}
// let r = subsets([1, 2, 3])
// console.log(r)

// @lc code=end
