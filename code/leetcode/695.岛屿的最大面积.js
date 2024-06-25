/*
 * @lc app=leetcode.cn id=695 lang=javascript
 *
 * [695] 岛屿的最大面积
 */

// @lc code=start
/**
 * @param {number[][]} grid
 * @return {number}
 */
var maxAreaOfIsland = function (grid) {
    let rows = grid.length
    let cols = grid[0].length
    let ans = 0
    function dfs(i, j) {
        if (
            i < 0 ||
            j < 0 ||
            i > rows - 1 ||
            j > cols - 1 ||
            grid[i][j] !== 1
        ) {
            return 0
        }
        grid[i][j] = 0
        let top = dfs(i + 1, j)
        let bottom = dfs(i - 1, j)
        let left = dfs(i, j + 1)
        let right = dfs(i, j - 1)

        return 1 + top + bottom + left + right
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                ans = Math.max(ans, dfs(i, j))
            }
        }
    }
    return ans
}
// @lc code=end
