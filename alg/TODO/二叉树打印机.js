// https://cloud.tencent.com/developer/ask/60848
class Node {
    constructor(val, lv = null, rv = null) {
        this.val = val
        this.left = lv
        this.right = rv
    }
}
var levelOrder = function(root) {
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

class BTreePrinter {
    printNode(root) {
        let maxLevel = this.maxLevel(root)

        this.printNodeInternal([root], 1, maxLevel)
    }

    printNodeInternal(nodes, level, maxLevel) {
        if (!nodes.length || this.isAllElementsNull(nodes)) return

        let floor = maxLevel - level
        let endgeLines = parseInt(Math.pow(2, Math.max(floor - 1, 0)))
        let firstSpaces = parseInt(Math.pow(2, floor) - 1)
        let betweenSpaces = parseInt(Math.pow(2, floor + 1) - 1)

        this.printWhitespaces(firstSpaces)

        let newNodes = []
        for (let node of nodes) {
            if (node != null) {
                console.log(node.val)
                newNodes.push(node.left)
                newNodes.push(node.right)
            } else {
                newNodes.push(null)
                newNodes.push(null)
                // console.log(' ')
            }

            this.printWhitespaces(betweenSpaces)
        }
        // console.log('')

        for (let i = 1; i <= endgeLines; i++) {
            for (let j = 0; j < nodes.length; j++) {
                this.printWhitespaces(firstSpaces - i)
                if (nodes[j] == null) {
                    this.printWhitespaces(endgeLines + endgeLines + i + 1)
                    continue
                }

                if (nodes[j].left != null) console.log('/')
                else this.printWhitespaces(1)

                this.printWhitespaces(i + i - 1)

                if (nodes[j].right != null) console.log('\\')
                else this.printWhitespaces(1)

                this.printWhitespaces(endgeLines + endgeLines - i)
            }

            // console.log('')
        }

        this.printNodeInternal(newNodes, level + 1, maxLevel)
    }

    printWhitespaces(count) {
        for (let i = 0; i < count; i++) console.log(' ')
    }

    maxLevel(node) {
        if (node == null) return 0

        return Math.max(this.maxLevel(node.left), this.maxLevel(node.right)) + 1
    }

    isAllElementsNull(list = []) {
        return list.every(x => {
            return !x
        } )
    }
}

var r = new BTreePrinter()
r.printNode(createTree([1, 2, 3]))
