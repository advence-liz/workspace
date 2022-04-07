/*
 * @lc app=leetcode.cn id=863 lang=javascript
 *
 * [863] 二叉树中所有距离为 K 的结点
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
 * @param {TreeNode} target
 * @param {number} k
 * @return {number[]}
 */
var distanceK = function(root, target, k) {
    let parentMap = new Map()
    let res = []
    let visited = new Set()
    function setParent(root, parent) {
        if (!root) return
        if (parent) parentMap.set(root, parent)
        setParent(root.left, root)
        setParent(root.right, root)
    }
    setParent(root)

    function dsf(root, from, k) {
        console.log(root, from)
        if (!root) return
        if (root === from) return

        // visited.add(root)
        if (k === 0) {
            res.push(root.val)
        }
        // dsf(root.left, root, k - 1)
        // dsf(root.right, root, k - 1)
        // dsf(parentMap.get(root), root, k - 1)
        // if (root.left !== from) {
        //     dsf(root.left, root, k - 1)
        // }
        // if (root.right !== from) {
        //     dsf(root.right, root, k - 1)
        // }

        // if (parentMap.get(root) !== from) {
        //     dsf(parentMap.get(root), root, k - 1)
        // }
        // if (!visited.has(root.left)) {
        //     dsf(root.left, root, k - 1)
        // }
        // if (!visited.has(root.right)) {
        //     dsf(root.right, root, k - 1)
        // }

        // if (!visited.has(parentMap.get(root))) {
        //     dsf(parentMap.get(root), root, k - 1)
        // }
    }
    dsf(target, null, k)
    return res
}
// @lc code=end
