function treeDeep (root) {
  if (!root) return 0

  return Math.max(treeDeep(root.left), treeDeep(root.right)) + 1
}

module.exports = {
  treeDeep
}
