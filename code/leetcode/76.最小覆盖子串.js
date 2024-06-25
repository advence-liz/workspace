/*
 * @lc app=leetcode.cn id=76 lang=javascript
 *
 * [76] 最小覆盖子串
 */
// 输入: S = ""ADOBEC"ODEBANC", T = "ABC"
// 输出: "BANC"
// @lc code=start
/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function getNeeds(t = '') {
    let m = {}
    for (let i of t) {
        if (m[i] === undefined) m[i] = 1
        else m[i]++

        
    }
    m.length = Object.keys(m).length
    return m
}

var minWindow = function(s, t) {
    let left = 0
    let right = 0
    let start = 0
    let minLen = Infinity
    let needs = getNeeds(t)
    let window = {}
    let match = 0
    for (let c of t) {
        window[c] = 0
    }

    while (right < s.length) {
        let c1 = s[right]
        if (needs[c1]) {
            window[c1]++
            if (window[c1] === needs[c1]) match++
        }
        right++

        while (match === needs.length) {
            if (right - left < minLen) {
                minLen = right - left
                start = left
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

    return minLen === Infinity ? '' : s.substr(start, minLen)
}
// let r = minWindow('aa', 'aa')
// console.log(r)
// @lc code=end
