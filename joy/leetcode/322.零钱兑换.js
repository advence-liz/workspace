/*
 * @lc app=leetcode.cn id=322 lang=javascript
 *
 * [322] 零钱兑换
 */

// @lc code=start
/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 * 明确「状态」 -> 定义 dp 数组/函数的含义 -> 明确「选择」-> 明确 base case。
 */
// var coinChange = function(coins, amount) {

//     // 数组大小为 amount + 1，初始值也为 amount + 1 相当于 infinite
//     let  dp = new Array (amount + 1).fill(amount+1)
//     // base case
//     dp[0] = 0
//     for (let i = 0; i < dp.length; i++) {
//         // 内层 for 在求所有子问题 + 1 的最小值
//         for (let coin of coins) {
//             // 子问题无解，跳过
//             if (i - coin < 0) continue
//             dp[i] = Math.min(dp[i], 1 + dp[i - coin])
//         }
//     }
//     return (dp[amount] == amount + 1) ? -1 : dp[amount]
// }
var coinChange = function(coins, amount) {
    function dp(n) {
        if (n === 0) return 0
        if (n < 0) return -1

        let res = Infinity
        for (let coin of coins) {
            let sub = dp(n - coin)
            if (sub === -1) continue
            res = Math.min(res, sub + 1)
        }
        return res === Infinity ? -1 : res
    }
    return dp(amount)
}
// @lc code=end
