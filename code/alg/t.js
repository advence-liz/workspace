/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param s string字符串 输入
 * @return int整型
 */
function longestValidParentheses(s) {
    // write code here
    let n = s.length

    let dp = new Array(n+1).fill(0)

    for (let i = 1; i < n; i++) {
        if (s[i] === ')' && s[i - 1] === '(') {
            dp[i] = dp[i - 1] + 2
        } else {
            dp[i] = dp[i - 1]
        }
        console.log(dp[i])
    }
    // let max = Math.max(...dp)
    // return max
    return dp[n - 1]
}

longestValidParentheses('))))')
module.exports = {
    longestValidParentheses: longestValidParentheses
}
