/*
 * @lc app=leetcode.cn id=3 lang=javascript
 *
 * [3] 无重复字符的最长子串
 */
/**
 * @param {string} s
 * @return {number}
 * abcabcbb
 */
var lengthOfLongestSubstring = function (s) {
    // let m = new Map()
    let set = new Set()
    let left = 0
    let right = 0
    let max = 0
    let len = s.length

    for (; right < len; right++) {
        // // // 不符合条件
        while (set.has(s[right])) {
            set.delete(s[left])
            left++
        }

        set.add(s[right])

        // state[s[right]] = true
        // while (m.has(s[right])) {
        //     left = m.get(s[right]) + 1
        // }

        // if (m.has(s[right])) {
        //     left = Math.max(left, m.get(s[right]) + 1)
        //     console.log(s[right], left)
        // }
        // m.set(s[right], right)
        max = Math.max(max, right - left + 1)
    }
    return max
}

// var r = lengthOfLongestSubstring('abcabcbb')
// console.log(r)
