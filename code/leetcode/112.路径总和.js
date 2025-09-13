/*
 * @lc app=leetcode.cn id=112 lang=javascript
 *
 * [112] 路径总和
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
 * @param {number} targetSum
 * @return {boolean}
 * 自顶向下
 */
var hasPathSum = function (root, targetSum) {
    function dfs(node, sum) {
        if (!node) return false
        // 如果是叶子节点
        if (!node.left && !node.right) {
            return node.val === sum
        }
        // 递归检查左右子树
        return dfs(node.left, sum - node.val) || dfs(node.right, sum - node.val)
    }
    return dfs(root, targetSum)
}

// @lc code=end
