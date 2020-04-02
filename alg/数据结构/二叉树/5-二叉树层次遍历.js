const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3, 4, 5, 6, 7])
print(root)
/**
 * 
 * 利用队列广度优先每次队列
 */
function travel(root) {
    if (!root) return
    let queue = []
    let res = []
    queue.push(root)
    while (queue.length) {
        let size = queue.length
        let tmp = []
        for (let i = 0; i < size; i++) {
            let node = queue.shift()
            tmp.push(node.val)

            if (node.left) queue.push(node.left)
            if (node.right) queue.push(node.right)
        }
        res.push(tmp)
    }
    console.log(res)
}
travel(root)
// binaryTreePaths(root)
