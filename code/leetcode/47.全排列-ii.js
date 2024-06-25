/*
 * @lc app=leetcode.cn id=47 lang=javascript
 *
 * [47] 全排列 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 * https://leetcode-cn.com/problems/permutations-ii/solution/hot-100-47quan-pai-lie-ii-python3-hui-su-kao-lu-zh/
 */
var permuteUnique = function(nums) {
    let res = []
    function dsf(nums, paths, visited) {
        if (paths.length === nums.length) {
            res.push(paths.slice())
        }
        for (let i = 0; i < nums.length; i++) {
            if (visited[i]) continue
            // i 大于 begin 同层中相同值前一个节点已经遍历过
            if (i > 0 && nums[i] === nums[i - 1] && !visited[i - 1]) continue
            paths.push(nums[i])
            visited[i] = true
            dsf(nums, paths, visited)
            visited[i] = false
            paths.pop()
        }
    }

    dsf(
        nums.sort((a, b) => a - b),
        [],
        {}
    )
    return res
}
// @lc code=end
