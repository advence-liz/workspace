/*
 * @lc app=leetcode.cn id=3 lang=javascript
 *
 * [3] 无重复字符的最长子串
 */
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    let m = new Map()
    let left = 0
    let right = 0
    let max = 0
    let len = s.length

    while (right < len) {
        let rc = s[right]

        m.set(rc, m.has(rc) ? m.get(rc) + 1 : 1)

        while (m.get(rc) > 1) {
            let lc = s[left]
            m.set(lc, m.get(lc) - 1)
            left++
        }
        right++
        max = Math.max(max, right - left)
    }
    return max
}

var r = lengthOfLongestSubstring('abcabcbb')
console.log(r)
