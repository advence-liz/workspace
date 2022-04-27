/*
 * @lc app=leetcode.cn id=438 lang=javascript
 *
 * [438] 找到字符串中所有字母异位词
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */

function getNeeds(str) {
    let m = {}
    for (let c of str) {
        if (!m[c]) m[c] = 1
        else m[c]++
    }
    m.length = Object.keys(m).length
    return m
}
var findAnagrams = function (s, p) {
    let needs = getNeeds(p)
    let window = {}
    for (let c of Object.keys(needs)) {
        window[c] = 0
    }
    let left = 0
    let right = 0
    let match = 0
    let res = []
    while (right < s.length) {
        let c1 = s[right]
        if (needs[c1]) {
            window[c1]++
            if (window[c1] === needs[c1]) {
                match++
            }
        }
        right++
        while (match === needs.length) {
            if (right - left === p.length) {
                res.push(left)
            }
            let c2 = s[left]
            if (needs[c2]) {
                window[c2]--
                if (window[c2] < needs[c2]) {
                    match--
                }
            }
            left++
        }
    }
    return res
}
// findAnagrams('cbaebabacd', 'abc')
// @lc code=end
