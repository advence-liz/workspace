function dsf(root) {
  if (!root) return null
  let res = []
  let stack = []
  stack.push(root)

  while (stack.length) {
    let node = stack.pop()

    if (node.right) {
      stack.push(node.right)
    }
    if (node.left) {
      stack.push(node.left)
    }
  }
}
