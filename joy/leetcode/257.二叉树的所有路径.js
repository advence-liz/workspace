/*
 * @lc app=leetcode.cn id=257 lang=javascript
 *
 * [257] 二叉树的所有路径
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {string[]}
 * 回溯
 */
var binaryTreePaths = function(root) {
  let res = []
  function dsf(root, routes = []) {
    if (!root) {
      return res.push(routes.join('->'))
    }

    routes.push(root.val)
    dsf(root.left)
    dsf(root.right)
    routes.pop()
  }
  dsf(root)
  return res
}
// @lc code=end
