const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3, null, 5])
print(root)

// function binaryTreePaths(root) {
//   let paths = []
//   let res = []
//   let dfs = root => {
//     if (!root) return
//     paths.push(root)
//     if (root.left) dfs(root.left)
//     if (root.right) dfs(root.right)
//     if (!root.left && !root.right) {
//       res.push(paths.map(item => item.val).join('->'))
//       // 注意每访问完一个节点记得把它从path中删除，达到回溯效果
//     }
//     paths.pop()
//   }
//   dfs(root)
//   console.log(res)
//   return res
// }
// var binaryTreePaths = function(root) {
//   let res = []
//   function dsf(root, routes) {
//     // if (!root) {
//     //   return
//     // }

//     routes.push(root.val)

//     if (!root.left && !root.right) {
//       res.push(routes.join('->'))
//     }

//     if (root.left) {
//       dsf(root.left, routes)
//     }
//     if (root.right) {
//       dsf(root.right, routes)
//     }

//     routes.pop()
//   }
//   dsf(root, [])
//   return res
// }
// 自顶向下传入
function binaryTreePaths(root) {
  if (!root) return
  const res = []
  function dsf(root, path = '') {
    if (!root) return
    path += root.val
    if (!root.left && !root.right) {
      return res.push(path)
    }
    dsf(root.left, path + '->')
    dsf(root.right, path + '->')
  }
  dsf(root)
  return res
}
var r = binaryTreePaths(root)
console.log(r)
