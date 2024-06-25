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
var hasPathSum = function(root, targetSum) {
  function dsf(node, targetSum) {
    if (!node) return false
    if (node.val === targetSum) return true
    if (!node.left && node.right) {
      return node.val === targetSum
    }

    return (
      dsf(node.left, targetSum - node.val) ||
      dsf(node.right, targetSum - node.val)
    )
  }
  return dsf(root, targetSum)
}
// @lc code=end
