/*
 * @lc app=leetcode.cn id=652 lang=javascript
 *
 * [652] 寻找重复的子树
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
 * @return {TreeNode[]}
 */
var findDuplicateSubtrees = function(root) {
    let res = []
    let m = new Map()

    function dfs(root) {
        if (!root) {
            return '#'
        }

        let left = dfs(root.left)
        let right = dfs(root.right)
        // 加 , 是为了确保为 string  ，不然 val 为 num
        let subTree = root.val + ',' + left + ',' + right
        // 确保只添加有一次
        if (m.get(subTree) === 1) {
            res.push(root)
        }
        m.set(subTree, (m.get(subTree) || 0) + 1)

        return subTree
    }
    dfs(root)
    return res
}
// @lc code=end
