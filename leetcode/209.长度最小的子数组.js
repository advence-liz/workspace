/*
 * @lc app=leetcode.cn id=209 lang=javascript
 *
 * [209] 长度最小的子数组
 */

// @lc code=start
/**
 * @param {number} s
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(s, nums) {
    let min = Infinity
    let sum = 0
    let right = 0
    let left = 0
    for (; right < nums.length; right++) {
        sum = sum + nums[right]
        while (sum >= s) {
            min = Math.min(min, right + 1 - left)
            sum = sum - nums[left]
            left++
        }
    }

    return min === Infinity ? 0 : min
}
// minSubArrayLen(7,[2,3,1,2,4,3])
// var minSubArrayLen = function(s, nums) {
//     const int_max = Infinity
//     var i = 0, sum = 0, ans = int_max
//     for (var j = 0; j < nums.length; j++) {
//         sum += nums[j]
//         while (sum >= s) {
//             ans = Math.min(ans, j - i + 1)
//             sum -= nums[i++]
//         }
//     }
//     return ans === int_max ? 0 : ans
// }

// @lc code=end
