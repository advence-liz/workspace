/*
 * @lc app=leetcode.cn id=94 lang=javascript
 *
 * [94] 二叉树的中序遍历
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
 * @return {number[]}
 */
var inorderTraversal = function (root) {
    var results = []

    function traversal(root) {
        if (!root) return
        if (root.left) traversal(root.left)
        results.push(root.val)
        if (root.right) traversal(root.right)
    }

    traversal(root)
    return results
}
// @lc code=end
