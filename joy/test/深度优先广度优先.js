class Node {
    constructor(val, lv = null, rv = null) {
        this.val = val
        this.left = lv
        this.right = rv
    }
}

var root = new Node(1)

var left = new Node(2)

left.left = new Node(3)
left.right = new Node(4)

var right = new Node(5)
right.left = new Node(6)
right.right = new Node(7)


root.left = left
root.right = right

/**
 *      1
 *   2     5
 * 3   4  6  7
 */


/**
  * 先序
  * 1 2 3 4 5 6 7
  * 中序
  * 3 2 4 1 6 5 7
  * 后序
  * 3 4 2 6 7 5 1
  */

function preOrder(root, result = []) {
    if (!root) return


    result.push(root.val)
    preOrder(root.left, result)
    preOrder(root.right, result)
    return result
}
// console.assert(preOrder(root, []).join('')==='3426751','')
console.log('前序', preOrder(root, []))


function inOrder(root, result = []) {
    if (!root) return

    inOrder(root.left, result)
    result.push(root.val)
    inOrder(root.right, result)
    return result
}
console.log('中序', inOrder(root))

function postOrder(root, result = []) {
    if (!root) return

    postOrder(root.left, result)
    postOrder(root.right, result)
    result.push(root.val)
    return result
}
console.log('后序', postOrder(root))
