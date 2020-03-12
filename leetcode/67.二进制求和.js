/*
 * @lc app=leetcode.cn id=67 lang=javascript
 *
 * [67] 二进制求和
 */

// @lc code=start
/**
 * @param {string} a
 * @param {string} b
 * @return {string}
 * 输入: a = "1010", b = "1011"
 * 输出: "10101"
 */
var addBinary = function(a, b) {
    let carry = 0
    let i = a.length - 1
    let j = b.length - 1
    let res = ''
    while (i >= 0 || j >= 0) {
        let sum = 0
        let c1 = parseInt(i >= 0 ? a[i] : 0)
        let c2 = parseInt(j >= 0 ? b[j] : 0)
        sum = carry + c1 + c2
        // console.log('sum',sum,'c1',c1,'c2',c2)
        carry = parseInt(sum/2)
        res= sum%2 +res
        // res.push('')
        i--
        j--
    }
    if (carry) res =carry+ res 
    // console.log(res)
    return res
}
addBinary('1111', '1111')
// 10101
// @lc code=end
