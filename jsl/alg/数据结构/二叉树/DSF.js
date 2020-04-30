/**
 * 应用stack queue 解决深度和广度优先的问题可以思考普通的 tree 即有多个子节点的
 * 深度优先 等于前序遍历
 *
 * @param {*} root
 */
function dsf(root) {
    if (!root) return []
    var stack = []
    var results = []

    stack.push(root)

    while (stack.length) {
        var cur = stack.pop()
        cur && results.push(cur)

        // 对于普通的tree 就是 stack.push(...children)

        if (cur.right) {
            stack.push(cur.right)
        }
        if (cur.left) {
            stack.push(cur.left)
        }
    }
}
/**
 * 节点一层一层进入队列，先进先出
 * @param {*} root
 */
function bfs(root) {
    var queue = []
    var results = []
    queue.push(root)

    while (queue.length) {
        var cur = queue.shift()

        cur && results.push(cur)

        if (cur.left) {
            queue.push(cur.left)
        }
        if (cur.right) {
            queue.push(cur.right)
        }
    }
    return results
}
