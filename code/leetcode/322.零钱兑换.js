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
 *
 * 明确「状态」 -> 定义 dp 数组/函数的含义 -> 明确「选择」-> 明确 base case。
 */
// var coinChange = function(coins, amount) {
//     // 数组大小为 amount + 1，初始值也为 amount + 1 相当于 infinite
//     let dp = new Array(amount + 1).fill(amount + 1)
//     // base case
//     dp[0] = 0
//     for (let coin of coins) {
//         for (let j = 1; j <= amount; j++) {
//             // 内层 for 在求所有子问题 + 1 的最小值
//             // 子问题无解，跳过
//             if (j < coin) continue
//             dp[j] = Math.min(dp[j], 1 + dp[j - coin])
//         }
//     }
//     return dp[amount] == amount + 1 ? -1 : dp[amount]
// }

// var coinChange = function(coins, amount) {
//     let dp = new Array(amount + 1).fill(amount + 1)
//     function dsf(coins, target, level) {
//         // if (dp[target] !== Infinity) return dp[target]

//         if (target === 0) {
//             return level
//         }
//         if (target < 0) {
//             return -1
//         }
//         let ans = Infinity
//         for (let coin of coins) {
//             let sub = dsf(coins, target - coin, level + 1)
//             if (sub < 0) continue

//             ans = Math.min(sub, ans)
//         }
//         dp[target] = ans

//         return ans
//     }

//     var r = dsf(coins, amount, 0)
//     console.log(dp)
//     return r
// }

// var r = coinChange([1, 2, 5], 11)

// https://leetcode-cn.com/problems/coin-change/solution/by-flix-su7s/
// https://leetcode-cn.com/problems/coin-change/solution/javadi-gui-ji-yi-hua-sou-suo-dong-tai-gui-hua-by-s/
var coinChange = function(coins, amount) {
    let dp = new Array(amount + 1).fill(Infinity)
    function dsf(n) {
        if (n < 0) return -1
        if (n === 0) return 0
        // 得放在 n < 0 的后面
        if (dp[n] !== Infinity) return dp[n]
        let res = Infinity
        for (let coin of coins) {
            let sub = dsf(n - coin)
            if (sub === -1) continue
            res = Math.min(res, sub + 1)
        }
        let ans = res === Infinity ? -1 : res
        dp[n] = ans
        return ans
    }
    let r = dsf(amount)
    console.log(dp)
    return r
}
var r = coinChange([1, 2, 5], 11)

// @lc code=end
