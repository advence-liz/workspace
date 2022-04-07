/*
 * @lc app=leetcode.cn id=971 lang=javascript
 *
 * [971] 翻转二叉树以匹配先序遍历
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
 * @param {number[]} voyage
 * @return {number[]}
 */
var flipMatchVoyage = function(root, voyage) {
    let index = 0
    let res = []
    function dsf(root) {
        if (!root) return true
        if (root.val !== voyage[index++]) {
            return false
        }
        if (root.left && root.left.val !== voyage[index]) {
            res.push(root.val)
            return dsf(root.right) && dsf(root.left)
        } else {
            return dsf(root.left) && dsf(root.right)
        }
    }
    let r = dsf(root)
    if (!r) {
        res = [-1]
    }
    return res
}
// @lc code=end
