/*
 * @lc app=leetcode.cn id=543 lang=javascript
 *
 * [543] 二叉树的直径
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
var diameterOfBinaryTree = function(root) {
    let ans = 0

    function dsf(root) {
        if (!root) return 0

        let l = dsf(root.left)
        let r = dsf(root.right)

        ans = Math.max(ans, l + r + 1)

        return Math.max(l,r) + 1
    }

    dsf(root)

    return ans - 1
}
// @lc code=end
