const { createTree, print } = require('../helper')

var root = createTree([1, 2, 3, 4, 5, 6, 7])
print(root)

function bsf(root) {
    if (!root) return

    let quene = []

    quene.push(root)

    while (quene.length) {
        let node = quene.shift()

        console.log(node.val)

        if (node.left) {
            quene.push(node.left)
        }
        if (node.right) {
            quene.push(node.right)
        }
    }
}

bsf(root)
