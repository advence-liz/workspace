/*
 * @lc app=leetcode.cn id=455 lang=javascript
 *
 * [455] 分发饼干
 */

// @lc code=start
/**
 * @param {number[]} g
 * @param {number[]} s
 * @return {number}
 *
 *  g = [1,2,3] 三个孩子
 *  s = [1,1] 俩个饼干
 *
 */
var findContentChildren = function(g, s) {
    g.sort((a, b) => a - b)
    s.sort((a, b) => a - b)

    let gIndex = g.length - 1
    let ans = 0
    let sIndex = s.length - 1
    // let ans
    // for (let i = 0; i < s.length && index < g.length; i++) {
    //     if (s[i] >= g[index]) {
    //         index++
    //     }
    // }
    while (gIndex >= 0 && sIndex >= 0) {
        if (s[sIndex] >= g[gIndex]) {
            sIndex--
            ans++
        }
        gIndex--
    }

    return ans
}
// @lc code=end
