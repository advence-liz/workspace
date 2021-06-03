const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3, 4, 5])
print(root)

function postOrder(root) {
    if (!root) return
    let s1 = []
    let s2 = []
    let paths = []
    s1.push(root)
    while (s1.length) {
        let node = s1.pop()
        s2.push(node)
        if (node.left) {
            s1.push(node.left)
        }
        if (node.right) {
            s1.push(node.right)
        }
    }

    while (s2.length) {
        paths.push(s2.pop().val)
    }
    console.log(paths)
}
postOrder(root)
// binaryTreePaths(root)
