const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4])
print(root)

// 深度优先遍历二叉树，如果当前节点为 p 或者 q，直接返回这个节点，
// 否则查看左右孩子，左孩子中不包含 p 或者 q 则去找右孩子，
// 右孩子不包含 p 或者 q 就去找左孩子，
// 剩下的情况就是左右孩子中都存在 p 或者 q, 那么此时直接返回这个节点。
// 深度优先遍历
function lca(root, p, q) {
    if (!root || root.val === p || root.val === q) return root
    let left = lca(root.left, p, q)
    let right = lca(root.right, p, q)
    if (!left ) return right
    if (!right) return left
    return root
}

var r = lca(root, 6, 7)
console.log(r.val)
