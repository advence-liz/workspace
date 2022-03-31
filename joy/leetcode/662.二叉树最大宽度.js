/*
 * @lc app=leetcode.cn id=662 lang=javascript
 *
 * [662] 二叉树最大宽度
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
var widthOfBinaryTree = function(root) {
    let ans = 0
    // [node,dept,pos]
    let queue = [[root, 0, 0]]
    let curDept = 0
    let curLeft = 0
    while (queue.length) {
        let [node, dept, pos] = queue.shift()
        if (node) {
            queue.push([node.left, dept + 1, pos * 2])
            queue.push([node.right, dept + 1, pos * 2 + 1])

            if (curDept !== dept) {
                curDept = dept
                curLeft = pos
            }
            ans = Math.max(ans, pos - curLeft + 1)
        }
    }

    return ans
}
// var widthOfBinaryTree = function(root) {
//     let ans = 0
//     let leftMap = new Map()
//     function dsf(root, depth, pos) {
//         if (!root) return

//         if (!leftMap.has(depth)) {
//             leftMap.set(depth, pos)
//         }
//         ans = Math.max(ans, pos - leftMap.get(depth) + 1)

//         dsf(root.left, depth + 1, pos * 2)
//         dsf(root.right, depth + 1, pos * 2 + 1)
//     }
//     dsf(root, 0, 0)
//     return ans
// }
// @lc code=end
