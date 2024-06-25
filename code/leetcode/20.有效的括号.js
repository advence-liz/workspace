/*
 * @lc app=leetcode.cn id=20 lang=javascript
 *
 * [20] 有效的括号
 */

// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 * 2[3[b]]
 * ([{}])
 * [(,[,{]
 */
var isValid = function(s) {
    let m = new Map([
        ['(', ')'],
        ['[', ']'],
        ['{', '}']
    ])
    let stack = []
    // 遍历字符串
    for (let c of s) {
        // 括号左半边入栈
        if (m.has(c)) {
            stack.push(c)
        }
        // 括号右半边出栈
        else {
            let left = stack.pop()
            if (m.get(left) !== c) {
                return false
            }
        }
    }
    // stack length 为 0 即为 true
    return !stack.length
}
// @lc code=end
