/*
 * @lc app=leetcode.cn id=102 lang=javascript
 *
 * [102] 二叉树的层次遍历
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
 * @return {number[][]}
 */
var levelOrder = function (root) {
    var quene = []
    var cur = root
    var level = 0
    quene.push(cur)
    var res = []
    while (quene.length) {
        res.push([])
        var size = quene.length

        while (size--) {
            var node = quene.shift()

            res[level].push(node.val)
            if (node.left) {
                quene.push(node.left)
            }
            if (node.right) {
                quene.push(node.right)
            }

        }

        level++

    }

    return res
}
// @lc code=end

