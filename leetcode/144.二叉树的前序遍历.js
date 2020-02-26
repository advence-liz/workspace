/*
 * @lc app=leetcode.cn id=144 lang=javascript
 *
 * [144] 二叉树的前序遍历
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
// var preorderTraversal = function (root) {
//   if (root == null) {
//     return []
//   }
//   var stack = []
//   var result = []
//   stack.push(root)
//   while (stack.length) {
//     var cur = stack.pop()
//     cur && result.push(cur.val)

//     if (cur.right) {
//       stack.push(cur.right)
//     }

//     if (cur.left) {
//       stack.push(cur.left)
//     }

//   }
//   return result

// }
/**
 * 广度优先（名字不能换了leetcode 就不行了）
 * 广度优先就是 输入跟输出一样因为leetcode 的输入形式就是广度优先
 * 应用stack queue 解决深度和广度优先的问题可以思考普通的 tree 即有多个子节点的
 * @param {*} root 
 */
var preorderTraversal = function (root) {
    if (root == null) {
        return []
    }
    var queue = []
    var result = []
    queue.push(root)
    while (queue.length) {
        var cur = queue.shift()
        cur && result.push(cur.val)
        // queue.push(...children)
        if (cur.left) {
            queue.push(cur.left)
        }

        if (cur.right) {
            queue.push(cur.right)
        }

    
    }
    return result

}

// [1,2,5,3,4]
// @lc code=end

