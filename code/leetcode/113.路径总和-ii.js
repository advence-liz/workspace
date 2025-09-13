/*
 * @lc app=leetcode.cn id=113 lang=javascript
 *
 * [113] 路径总和 II
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
 * @return {number[][]}
 */
var pathSum = function (root, targetSum) {
    let res = []
    function dsf(root, paths, targetSum) {
        if (!root) return
        paths.push(root.val)
        if (targetSum === root.val && !root.left && !root.right) {
            res.push(paths.slice())
            // res.push(...paths)
        }

        dsf(root.left, paths, targetSum - root.val)
        dsf(root.right, paths, targetSum - root.val)
        paths.pop()
    }
    dsf(root, [], targetSum)
    return res
}
// @lc code=end
