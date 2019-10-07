// https://lufficc.com/blog/heap-sort-and-max-priority-queue

// https://www.jianshu.com/p/90bf2dcd6a7b
// http://bubkoo.com/2014/01/14/sort-algorithm/heap-sort/   js

/**
 * 堆是完全二叉树
 * 当前节点的左孩子 2i+1 右孩子 2i+2 ,parent  (i-1）/2
 */

function left(i) {
    return i * 2 + 1
}

function right(i) {
    return i * 2 + 2
}
function parent(i) {
    return (i + 1) / 2 - 1
}
function swap(arr, i, j) {
    let temp = arr[i]

    arr[i] = arr[j]

    arr[j] = temp
}

function maxHeapify(arr, i, length) {
    let l = left(i)
    let r = right(i)
    let max
    if (l < length && arr[l] > arr[i]) {
        max = l
    } else {
        max = i
    }
    if (r < length && arr[r] > arr[max]) {
        max = r
    }
    if (max !== i) {
        swap(arr, i, max)
        maxHeapify(arr, max, length)
    }
}
