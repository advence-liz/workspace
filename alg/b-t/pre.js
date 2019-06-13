const createTree = require('./d-t')

/**
 *        10
 *    5          15
 * 3     6    12     16
 * 10 5 3 6 15 12 16
 * 3 6 5 12 16 15 10
 */
let root = createTree([10, 5, 3, 6, 15, 12, 16])

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

// preTraverseBTree(root)
afterTraverseBTree(root)

function treeDeep (root) {
  if (!root) return 0

  return Math.max(treeDeep(root.left), treeDeep(root.right)) + 1
}
console.log(treeDeep(root))
