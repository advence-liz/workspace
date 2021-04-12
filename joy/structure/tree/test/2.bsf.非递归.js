const { createTree, print } = require('../helper')

var root = createTree([1, 2, 3, 4, 5, 6, 7])
print(root)

function bsf(root) {
  if (!root) return
  var queue = []
  var res = []
  queue.push(root)

  while (queue.length) {
    var cur = queue.shift()
    res.push(cur.val)

    if (cur.left) {
      queue.push(cur.left)
    }
    if (cur.right) {
      queue.push(cur.right)
    }
  }
  console.log(res)
}

bsf(root)
