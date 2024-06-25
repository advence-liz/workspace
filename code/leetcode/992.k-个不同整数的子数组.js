/*
 * @lc app=leetcode.cn id=992 lang=javascript
 *
 * [992] K 个不同整数的子数组
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var subarraysWithKDistinct = function(nums, k) {
    function sd(nums, k) {
        let left = 0
        let len = nums.length
        let m = new Map()
        let ans = 0

        for (let right = 0; right < len; right++) {
            let r = nums[right]
            m.set(r, m.has(r) ? m.get(r) + 1 : 1)

            while (m.size > k) {
                let l = nums[left]
                m.set(l, m.get(l) - 1)

                if (m.get(l) === 0) {
                    m.delete(l)
                }
                left++
            }
            // console.log(right, left)

            ans = ans + right - left + 1
        }
        return ans
    }
    return sd(nums, k) - sd(nums, k - 1)
}
// @lc code=end
// var r = subarraysWithKDistinct([1, 2, 1, 2, 3], 2)
