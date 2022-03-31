/*
 * @lc app=leetcode.cn id=104 lang=javascript
 *
 * [104] 二叉树的最大深度
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
 var maxDepth = function(root) {
    function dsf(root) {
        if (!root) return 0
        let left = dsf(root.left)
        let right = dsf(root.right)

        return Math.max(left, right) + 1
    }
    return dsf(root)
}
// var maxDepth = function(root) {
//   var answer = 0
//   function dsf(root, depth) {
//     if (!root) return
//     if (!root.left && !root.right) {
//       answer = Math.max(answer, depth)
//     }
//     dsf(root.left, depth + 1)
//     dsf(root.right, depth + 1)
//   }

//   dsf(root, 1)
//   return answer
// }
// @lc code=end
