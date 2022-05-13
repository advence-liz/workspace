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
    let m = new Map()
    for (let c of str) {
        if (!m[c]) m[c] = 1
        else m[c]++
    }
    return m
}
var findAnagrams = function(s, p) {
    let needs = getNeeds(p)
    let m = new Map()
    let left = 0
    let right = 0
    let match = 0
    let res = []
    for (; right < s.length; right++) {
        let rc = s[right]
        if (needs.has(rc)) {
            m.set(rc, m.has(rc) ? m.get(rc) + 1 : 1)

            if (m.get(rc) === needs.get(rc)) {
                match++
            }
        }

        while (match === needs.size) {
            if (right - left + 1 === p.length) {
                res.push(left)
            }
            let lc = s[left]
            if (needs.has(lc)) {
                m.set(lc, m.get(lc) - 1)
                if (m.get(lc) < needs.get(lc)) {
                    match--
                }
            }
            left++
        }
    }
    return res
}
findAnagrams('cbaebabacd', 'abc')
// @lc code=end
