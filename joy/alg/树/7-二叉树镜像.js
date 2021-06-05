// https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/
var mirrorTree = function(root) {
  if (!root) return null
  var tmp = root.left
  root.left = mirrorTree(root.right)
  root.right = mirrorTree(tmp)
  return root
}
