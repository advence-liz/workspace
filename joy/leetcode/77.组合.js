/*
 * @lc app=leetcode.cn id=77 lang=javascript
 * @lcpr version=30203
 *
 * [77] 组合
 */

// @lc code=start
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function (n, k) {
    let track = []
    let res = []

    function backtrack(start) {
        if (track.length === k) {
            res.push([...track])
            return
        }
        for (let i = start; i <= n; i++) {
            track.push(i)
            console.log('push', i)
            backtrack(i + 1)

            let r = track.pop()
            console.log('pop', r)
        }
    }
    backtrack(1)
    return res
}
// @lc code=end

/*
// @lcpr case=start
// 4\n2\n
// @lcpr case=end

// @lcpr case=start
// 1\n1\n
// @lcpr case=end

 */
