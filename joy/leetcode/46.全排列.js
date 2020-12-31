/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    let res = []
    function dsf(nums, track) {
        if (nums.length === track.length) {
            // console.log(track)
            res.push([...track])
            // console.log(res)
            return
        }
        for (let n of nums) {
            if (track.includes(n)) continue
            // console.log(n)
            track.push(n)
            dsf(nums, track)
            track.pop()
        }
    }
    dsf(nums, [])
    return res
}
let r = permute([1, 2, 3])
console.log(r)
// @lc code=end
