/*
 * @lc app=leetcode.cn id=106 lang=javascript
 *
 * [106] 从中序与后序遍历序列构造二叉树
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
 * @param {number[]} inorder
 * @param {number[]} postorder
 * @return {TreeNode}
 * https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/solution/tu-jie-gou-zao-er-cha-shu-wei-wan-dai-xu-by-user72/
 */

// function TreeNode(val, left, right) {
//   this.val = val === undefined ? 0 : val
//   this.left = left === undefined ? null : left
//   this.right = right === undefined ? null : right
// }
var buildTree = function(inorder, postorder) {
  var inorderMap = new Map()

  for (var i = 0; i < inorder.length; i++) {
    inorderMap.set(inorder[i], i)
  }

  function buildTreeInner(is, ie, ps, pe) {
    if (ie < is || pe < ps) return null
    var root = postorder[pe]
    var node = new TreeNode(root)
    var ri = inorderMap.get(root)

    // node.left = buildTree(is, ri - 1, ps, ps + ri - is - 1);
    // node.right = buildTree(ri + 1, ie, ps + ri - is, pe - 1);

    node.left = buildTreeInner(is, ri - 1, ps, ps + ri - is - 1)
    node.right = buildTreeInner(ri + 1, ie, ps + ri - is, pe - 1)
    return node
  }
  return buildTreeInner(0, inorder.length - 1, 0, postorder.length - 1)
}
// @lc code=end
