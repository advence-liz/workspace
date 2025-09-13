function bsf(root) {
    if (!root) return

    let stack = []
    stack.push(root)

    while (stack.length) {
        let node = stack.pop()

        console.log(node.val)
    }
}
