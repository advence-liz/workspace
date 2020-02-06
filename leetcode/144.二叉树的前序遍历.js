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
var preorderTraversal = function (root) {
  if (root == null) {
    return []
  }
  var stack = []
  var result = []
  stack.push(root)
  while (stack.length) {
    var cur = stack.pop()
    cur && result.push(cur.val)

    if (cur.right) {
      stack.push(cur.right)
    }

    if (cur.left) {
      stack.push(cur.left)
    }

  }
  return result

}
// @lc code=end

