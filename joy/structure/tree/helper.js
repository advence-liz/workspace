// https://nilzzzz.github.io/2017/04/%E5%B0%86%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84%E5%8F%98%E6%88%90%E4%BA%8C%E5%8F%89%E6%A0%91/
class Node {
  constructor(val, lv = null, rv = null) {
    this.val = val
    this.left = lv
    this.right = rv
  }
}
var levelOrder = function(root) {
  if (!root) return []
  let queue = []
  let res = []
  let level = 0
  queue.push(root)
  while (queue.length) {
    res.push([])
    let size = queue.length
    // 注意一下: size -- 在层次遍历中是一个非常重要的技巧
    while (size--) {
      // 出队
      let front = queue.shift()
      res[level].push(front.val)
      // 入队
      if (front.left) queue.push(front.left)
      if (front.right) queue.push(front.right)
    }
    level++
  }
  return res
}

/**
 * 生成二叉树工具函数
 * @param {string|number} array  完全二叉树数组如：[1, 2, 3, 4] [1, 2, null, 4]
 * @example
 * var root = createTree([1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'])
 * print(root)
 *        1
 *    2       3
 *  4   5   6   7
 * 8 9 A B C D E F
 */
function createTree(array = []) {
  let list = []
  for (let i = 0; i < array.length; i++) {
    if (array[i] === null) list.push(null)
    else list.push(new Node(array[i]))
  }
  // 构建二叉树
  if (list.length > 0) {
    for (let i = 0; i < array.length / 2 - 1; i++) {
      // i表示的是根节点的索引，从0开始
      if (list[2 * i + 1] != null) {
        // 左结点
        list[i].left = list[2 * i + 1]
      }
      if (list[2 * i + 2] != null) {
        // 右结点
        list[i].right = list[2 * i + 2]
      }
    }
    // 判断最后一个根结点：因为最后一个根结点可能没有右结点，所以单独拿出来处理
    let lastIndex = parseInt(array.length / 2 - 1)
    // 左结点
    list[lastIndex].left = list[lastIndex * 2 + 1]
    // 右结点，如果数组的长度为奇数才有右结点
    if (array.length % 2 == 1) {
      list[lastIndex].right = list[lastIndex * 2 + 2]
    }
  }

  return list[0]
}

function print(root) {
  const arr = printTree(root)
  // console.log(arr)
  arr.forEach(val => {
    const r = val.reduce((ac, cur) => {
      return `${ac}${cur === '' ? ' ' : cur}`
    }, '')

    console.log(r)
  })
}

var printTree = function(root) {
  var res = []
  var m = getDepth(root, 0)
  var n = Math.pow(2, m) - 1
  for (var x = 0; x < m; x++) {
    if (!Array.isArray(res[x])) {
      res[x] = []
    }
    for (var y = 0; y < n; y++) {
      res[x][y] = ''
    }
  }
  set(root, 0, 0, n)
  return res
  function set(root, n, start, end) {
    if (!root || start > end) return
    var i = (start + (end - start) / 2) >> 0
    res[n][i] = root.val + ''
    set(root.left, n + 1, start, i - 1)
    set(root.right, n + 1, i + 1, end)
  }
  function getDepth(root, count) {
    if (!root) return count
    var l = getDepth(root.left, count + 1)
    var r = getDepth(root.right, count + 1)
    return Math.max(l, r)
  }
}

// var root = createTree([1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'])
// print(root)

module.exports = {
  createTree,
  print
}
