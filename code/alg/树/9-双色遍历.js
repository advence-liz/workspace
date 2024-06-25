const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3, 4, 5, 6, 7, 8])
print(root)

function colorTraversal(tree) {
  let stack = [[0, tree]]
  let res = []

  while (stack.length) {
    let [color, node] = stack.pop()
    if (!node) continue

    if (color === 0) {
      stack.push([0, node.right])
      stack.push([0, node.left])
      stack.push([1, node.val])
    } else {
      res.push(node)
    }
  }

  return res
}

console.log(colorTraversal(root))
