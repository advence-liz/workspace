/*
 * @lc app=leetcode.cn id=40 lang=javascript
 *
 * [40] 组合总和 II
 */

// @lc code=start
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 * [2,5,2,1,2]
 * 1,2,2,2,5     5
 */
var combinationSum2 = function(candidates, target) {
    let res = []

    function dsf(nums, paths, target, index) {
        if (target < 0) return

        if (target === 0) {
            res.push(paths.slice())
        }

        for (let i = index; i < nums.length; i++) {
            // if (nums[i] > target) {
            //     break
            // }
            // 小剪枝：同一层相同数值的结点，从第 2 个开始，候选数更少，结果一定发生重复，因此跳过，用 continue
            if (i > index && nums[i] === nums[i - 1]) continue
            paths.push(nums[i])
            // console.log(paths)
            dsf(nums, paths, target - nums[i], i + 1)
            paths.pop()
        }
    }

    dsf(
        candidates.sort((a, b) => a - b),
        [],
        target,
        0
    )

    return res
}
// 1 1 2 5 6 710
// const r = combinationSum2([10, 1, 2, 7, 6, 1, 5], 8)
// console.log(r)
// @lc code=end
