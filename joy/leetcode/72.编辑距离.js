/*
 * @lc app=leetcode.cn id=72 lang=javascript
 *
 * [72] 编辑距离
 */

// @lc code=start
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
    let m = word1.length
    let n = word2.length

    let dp = []
    for (let i = 0; i < m + 1; i++) {
        dp.push(new Array(n + 1).fill(0))
    }
    // base case   第一行 第一列
    for(let i = 0 ;i <= m ;i++){
        dp[i][0] = i
    }
    for(let j = 0; j<= n;j++){

        dp[0][j] = j
    }

    for (let i = 1; i <= m; i++) {

        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] =
                    Math.min(
                        dp[i - 1][j],
                        dp[i] [j - 1],
                        dp[i - 1][ j - 1]
                    ) + 1
            }

            // console.log(dp)
        }
        
    }

    return dp[m][n]
}
// @lc code=end
