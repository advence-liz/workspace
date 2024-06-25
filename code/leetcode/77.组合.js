/*
 * @lc app=leetcode.cn id=77 lang=javascript
 *
 * [77] 组合
 */

// @lc code=start
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 * 123
 * 12 13
 * 23
 *
 * 1234  tarck index
 * 1     1       1
 * 2     2       2
 *        1
 *    2   3   4
 *   1,2 1,3 1,4
 */
var combine = function(n, k) {
    const ans = []

    function dsf(n, k, index, track = []) {
        if (track.length == k) {
            ans.push([...track])
            return
        }
        // +1 是因为当前 i 还没有放到 track 中， n - (k - track.length) + 1
        //
        for (let i = index; i <= n - (k - track.length) + 1; i++) {
            track.push(i)
            dsf(n, k, i + 1, track)
            // console.log(track)
            track.pop()
        }
    }
    dsf(n, k, 1, [])

    return ans
}
// var r = combine(4, 2)
// console.dir(r)

// @lc code=end
