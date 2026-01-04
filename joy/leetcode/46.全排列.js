/*
 * @lc app=leetcode.cn id=46 lang=javascript
 * @lcpr version=30203
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
    let used = []
    let paths = []
    let res = []

    function backtrack(nums) {
        if (paths.length === nums.length) {
            res.push([...paths])
        }

        for (let n of nums) {
            if (used[n]) {
                continue
            }
            console.log('push', n)

            paths.push(n)
            used[n] = true

            backtrack(nums)

            used[n] = false
            console.log('pop', n)
            paths.pop()
        }
    }
    backtrack(nums)

    return res
}
// permute([1, 2, 3])
// @lc code=end

/*
// @lcpr case=start
// [1,2,3]\n
// @lcpr case=end

// @lcpr case=start
// [0,1]\n
// @lcpr case=end

// @lcpr case=start
// [1]\n
// @lcpr case=end

 */
