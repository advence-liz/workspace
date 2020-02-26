/**
 * 堆是完全二叉树 数组作为堆的存储媒介 i 从 0开始
 * 当前节点的左孩子 2i+1 右孩子 2i+2 ,parent  (i-1）/2
 */
function adjustMaxHeap(arr, index, length) {
    let max = index
    let left = 2 * index + 1
    let right = 2 * (index + 1)

    if (left < length && arr[max] < arr[left]) {
        max = left
    }
    if (right < length && arr[max] < arr[right]) {
        max = right
    }

    if (max !== index) {
        [arr[max], arr[index]] = [arr[index], arr[max]]
        adjustMaxHeap(arr, max, length)
    }
}
/**
 * 从最后一个非叶子节点开始，依次调整最大堆
 */
function buildMaxHeap(arr) {
    var length = arr.length
    var parent = Math.floor((length - 1) / 2)
    for (let i = parent; i >= 0; i--) {
        adjustMaxHeap(arr, i, length)
    }
}
let arr = [1, 2, 3, 4]

buildMaxHeap(arr)

function add(arr = [], element) {
    arr.push(element)
    if (arr.length === 1) return arr

    let i = arr.length - 1

    while (i >= 0) {
        let parent = parseInt((i - 1) / 2)
        if (arr[parent] < arr[i]) {
            [arr[parent], arr[i]] = [arr[i], arr[parent]]
            i = parent
            parent = parseInt((i - 1) / 2)
        } else {
            break
        }
    }
}
add(arr, 7)

function pop(arr) {
    let result = arr[0]
    arr[0] = arr.pop()

    adjustMaxHeap(arr, 0, arr.length)

    return result
}

pop(arr)
