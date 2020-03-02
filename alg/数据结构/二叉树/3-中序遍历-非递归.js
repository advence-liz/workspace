const { createTree, print } = require('./helper')

// 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
// 输出: 3
// 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
const root = createTree([1, 2, 3,4,5])
print(root)

function inOrder(root) {
    if(!root) return
    let stack = []
    let paths =[]
    let cur = root
    while(stack.length || cur){
       
        while(cur){
            stack.push(cur)
            cur = cur.left
        }
        cur = stack.pop()
        paths.push(cur.val)
        cur= cur.right
    }
    console.log(paths)
}
inOrder(root)
// binaryTreePaths(root)
