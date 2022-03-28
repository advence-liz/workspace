/*
 * @lc app=leetcode.cn id=129 lang=javascript
 *
 * [129] 求根节点到叶节点数字之和
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var sumNumbers = function(root) {
    let ans = 0
    function dfs(root, val = '') {
        if (!root) return
        val = val + String(root.val)
        if (!root.left && !root.right) {
            ans = ans + Number(val)
        }
        dfs(root.left, val)
        dfs(root.right, val)
    }
    dfs(root, 0)
    return ans
}
// @lc code=end
