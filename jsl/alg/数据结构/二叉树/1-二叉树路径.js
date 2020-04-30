const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3, null, 5])
print(root)

function binaryTreePaths(root) {
    
    let paths =[]
    let res = []
    let dfs = root => {
        if (!root ) return
        paths.push(root)
        if (root.left) dfs(root.left)
        if (root.right) dfs(root.right)
        if (!root.left && !root.right) {
            res.push(paths.map(item => item.val).join('->'))
            // 注意每访问完一个节点记得把它从path中删除，达到回溯效果
        }
        paths.pop()
    }
    dfs(root)
    console.log(res)
    return res
}
binaryTreePaths(root)
