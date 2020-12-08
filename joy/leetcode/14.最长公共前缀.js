/*
 * @lc app=leetcode.cn id=14 lang=javascript
 *
 * [14] 最长公共前缀
 */

// @lc code=start
/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function(strs) {
    if (!strs.length) return ''
    let prefix = ''
    let len = strs[0].length
    for (let i = 0; i < len; i++) {
        let c = strs[0][i]
        for (let j = 1; j < strs.length; j++) {
            if (c !== strs[j][i]) return prefix
        }
        prefix += c
    }
    return prefix
}

// @lc code=end
