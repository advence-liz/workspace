const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3,4,5])
print(root)

function binaryTreePaths(root) {
    let stack = []
    let paths = []
    var route =[]
    // let path = ''
    stack.push(root)
    paths.push(root.val)
    let res =[]


    
    while (stack.length) {
        let node = stack.pop()
        let path = paths.pop()
        route.push(node.val)
        if (node.right) {
            stack.push(node.right)
            paths.push(`${path}->${node.right.val}`)
            route.push(node.right.val)
        }
        if (node.left) {
            stack.push(node.left)
            paths.push(`${path}->${node.left.val}`)
        }
        if (!node.left && !node.right) {
            paths.push(path)
            
            res.push(route)
            // route.pop()
        }
    }
    console.log(route,res)
    return paths
}
binaryTreePaths(root)
