/*
 * @lc app=leetcode.cn id=3 lang=javascript
 * @lcpr version=30203
 *
 * [3] 无重复字符的最长子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
    let left = 0
    let right = 0
    let win = new Map()
    let res = 0

    while (right < s.length) {
        let c = s[right]
        right++

        win.set(c, (win.get(c) || 0) + 1)
        console.log('set', c)

        if (win.get(c) > 1) {
            let d = s[left]
            console.log('del', d)
            left++
            win.set(d, win.get(d) - 1)
        }
        res = Math.max(res, right - left)
    }
    return res
}
// @lc code=end

/*
// @lcpr case=start
// "abcabcbb"\n
// @lcpr case=end

// @lcpr case=start
// "bbbbb"\n
// @lcpr case=end

// @lcpr case=start
// "pwwkew"\n
// @lcpr case=end

 */
