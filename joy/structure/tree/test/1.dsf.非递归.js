const { createTree, print } = require('../helper')

var root = createTree([1, 2, 3, 4, 5, 6, 7])
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
