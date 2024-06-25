// https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/
// 输入：root = [4,2,7,1,3,6,9]
// 输出：[4,7,2,9,6,3,1]

/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
// var mirrorTree = function(root) {
//     if(!root) return null
//     var tmp = root.left
//     root.left = mirrorTree(root.right)
//     root.right = mirrorTree(tmp)
//     return  root

// };
var mirrorTree = function(root) {
  function dfs(root) {
    if (!root) return null
    var stack = []
    stack.push(root)
    while (stack.length) {
      var cur = stack.pop()
      if (cur.left) stack.push(cur.left)
      if (cur.right) stack.push(cur.right)
      var tmp = cur.left
      cur.left = cur.right
      cur.right = tmp
    }
  }
  dfs(root)
  return root
}
