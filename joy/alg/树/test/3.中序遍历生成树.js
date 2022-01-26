var arr = [1, 2, 3, 4, 5]

function createTree(arr, left, right) {
  if (left >= right) {
    return null
  }
  let mid = (right - left) / 2 + left
  var node = new Node(arr[mid])
  node.left = createTree(arr, left, mid - 1)
  node.right = createTree(arr, mid + 1, right)
}
