class Node {
  constructor (val, lv = null, rv = null) {
    this.value = val
    this.left = lv
    this.right = rv
  }
  //   set left (val) {
  //     this.left = val
  //   }
  //   set right (val) {
  //     this.right = val
  //   }
}

function insertTreeNode (root, val) {
  if (!root.value) {
    root.value = val
    return
  }

  if (val < root.value) {
    if (!root.left) {
      root.left = new Node(val)
      return
    }
    if (root.left) insertTreeNode(root.left, val)
  }

  if (val > root.value) {
    if (!root.right) {
      root.right = new Node(val)
      return
    }
    if (root.right) insertTreeNode(root.right, val)
  }
}

function createTree (arr) {
  let root = new Node()
  arr.forEach(val => {
    insertTreeNode(root, val)
  })

//   console.log(root)
  return root
}
module.exports = createTree
// /**
//  *        3
//  *  1          4
//  *     2
//  */
// createTree([3, 1, 2, 4])

