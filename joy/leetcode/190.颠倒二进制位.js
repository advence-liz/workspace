/*
 * @lc app=leetcode.cn id=190 lang=javascript
 *
 * [190] 颠倒二进制位
 */

// @lc code=start
/**
 * @param {number} n - a positive integer
 * @return {number} - a positive integer
 * 1101
 * >>> 0 https://zhuanlan.zhihu.com/p/100790268
 */
var reverseBits = function(n) {
    let res = 0
    for (let i = 0; i < 32; i++) {
        res = (res << 1) + (n & 1)
        n = n >>> 1
    }
    return res >>> 0
}
// @lc code=end
