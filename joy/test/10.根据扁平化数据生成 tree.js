// https://duola8789.github.io/2019/03/18/01%20%E5%89%8D%E7%AB%AF%E7%AC%94%E8%AE%B0/05%20%E7%AE%97%E6%B3%95/02%20%E7%AE%97%E6%B3%95%E7%BB%83%E4%B9%A0/%E7%AE%97%E6%B3%95%E7%BB%83%E4%B9%A005%20%E7%94%9F%E6%88%90%E6%A0%91%E5%BD%A2%E7%BB%93%E6%9E%84%E7%9A%84%E6%96%B9%E6%B3%95/

/**
 *    1
 *  2   3
 * 4 5 6 7
 */
var list = [
  { id: 1, parent: null, children: [] },
  { id: 2, parent: 1, children: [] },
  { id: 3, parent: 1, children: [] },
  { id: 4, parent: 2, children: [] },
  { id: 5, parent: 2, children: [] },
  { id: 6, parent: 3, children: [] },
  { id: 7, parent: 3, children: [] },
]
function createTree(list) {
  var childMap = {}
  var root = null
  for (var i = 0; i < list.length; i++) {
    var node = list[i]
    if (!node.parent) {
      root = node
    }

    if (childMap[node.parent]) {
      childMap[node.parent].push(node)
    } else {
      childMap[node.parent] = [node]
    }
  }

  for (var j = 0; j < list.length; j++) {
    list[j].children = childMap[list[j].id] || []
  }
  return root
}

var root = createTree(list)
console.log(root)
