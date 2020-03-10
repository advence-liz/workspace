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
    let window = {}
    let left = 0
    let right = 0
    let max = 0

    while (right < s.length) {
        let c1 = s[right]
        if( window[c1] === undefined){
            window[c1] = 1
        }else{
            window[c1]++
        } 
        right++

        while (window[c1] > 1) {
            let c2 = s[left]
            window[c2]--
            left++
        }
        max = Math.max(max, right - left)
    }
    return max
}

lengthOfLongestSubstring('abcabcbb')
