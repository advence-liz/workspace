const { createTree, print } = require('../helper')

var root = createTree([4, 2, 7, 1, 3, 6, 9])
// 4,7,2,9,6,3,1
print(root)
function dsf(root) {
  if (!root) return
  var stack = []
  var res = []
  stack.push(root)

  while (stack.length) {
    var cur = stack.pop()
    res.push(cur.val)
    if (cur.right) {
      stack.push(cur.right)
    }
    if (cur.left) {
      stack.push(cur.left)
    }
  }
  console.log(res)
}

dsf(root)
