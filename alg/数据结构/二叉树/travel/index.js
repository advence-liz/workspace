function preTraverseBTree (root) {
  if (!root) return
  //   if (!root.left && !root.right) console.log(root.value)
  console.log(root.value)
  preTraverseBTree(root.left)
  preTraverseBTree(root.right)
}

function afterTraverseBTree (root) {
  if (!root) return
  // if (!root.left && !root.right) console.log(root.value)

  afterTraverseBTree(root.left)
  afterTraverseBTree(root.right)
  console.log(root.value)
}
