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
    if (needle === '') return 0
    let res = -1

    for (let i = 0; i < haystack.length; i++) {
        let c = haystack[i]
        if (c === needle[0]) {
            let j = 0
            for (; j < needle.length; j++) {
                // console.log(haystack[j],needle[j - i])
                if (haystack[i + j] !== needle[j]) {
                    break
                }
            }

            if (j === needle.length) return i
        }
    }
    return res
}
// let r =strStr('mississippi', 'issip')
// console.log(r)
// @lc code=end
