/*
 * @lc app=leetcode.cn id=28 lang=javascript
 *
 * [28] 实现 strStr()
 */

// @lc code=start
/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
var strStr = function(haystack, needle) {
    for (let i = 0; i < haystack.length; i++) {
        let c = haystack[i]
        if (c === needle[0]) {
            for (let j = i; j < i + needle.length; j++) {
                if (haystack[j] !== needle[j - i]) return false
            }
            return i
        }
    }
    return -1
}
// @lc code=end
