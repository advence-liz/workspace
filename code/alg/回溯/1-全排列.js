/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 *        a
 *     1  2   3
 *     a
 *  1  2  3
 */
// https://labuladong.github.io/algo/di-ling-zh-bfe1b/hui-su-sua-56e11/
var permute = function(nums) {
    let res = []
    let track = []
    let used = []
    function backtrack(nums, start = 0) {
        if (nums.length === track.length) {
            res.push([...track])
        }
        for (let i = start; i < nums.length; i++) {
            if (used[i]) {
                continue
            }

            used[i] = true
            track.push(nums[i])
            backtrack(nums)
            track.pop()
            used[i] = false
        }
    }

    backtrack(nums, 0)

    return res
}
let r = permute([1, 2, 3])
console.log(r)
// @lc code=end
