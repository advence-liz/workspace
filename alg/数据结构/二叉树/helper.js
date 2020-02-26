// https://nilzzzz.github.io/2017/04/%E5%B0%86%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84%E5%8F%98%E6%88%90%E4%BA%8C%E5%8F%89%E6%A0%91/
class Node {
    constructor(val, lv = null, rv = null) {
        this.val = val
        this.left = lv
        this.right = rv
    }
}
var levelOrder = function (root) {
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

//用一个集合来存放每一个Node
function createTree(array = []) {
    let list = []
    for (let i = 0; i < array.length; i++) {
        list.push(new Node(array[i]))
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
    var r = levelOrder(root)
    r.forEach(x => console.log(x))
}

var root = createTree([1, 2, 3])
print(root)
module.exports = {
    createTree,
    print
}
