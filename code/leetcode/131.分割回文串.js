/*
 * @lc app=leetcode.cn id=131 lang=javascript
 *
 * [131] 分割回文串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string[][]}
 *       aab
 *     a   a   b
 *   a  \b   b
 * b
 */
var partition = function(s) {
    let f = new Array(s.length).fill(new Array(s.length).fill(0))
    let res = []
    function isPalindrome(s, left, right) {
        while (left <= right) {
            if (s[left] !== s[right]) {
                return false
            }
            left++
            right--
        }
        return true
    }
    function dsf(s, paths, index) {
        if (index === s.length) {
            res.push(paths.slice())
        }
        /**
         * index depth 树层数
         * i 通常字节点
         */
        for (let i = index; i < s.length; i++) {
            if (isPalindrome(s, index, i)) {
                paths.push(s.slice(index, i + 1))
                dsf(s, paths, i + 1)
                paths.pop()
            }
        }
    }
    dsf(s, [], 0)

    return res
}
// @lc code=end
