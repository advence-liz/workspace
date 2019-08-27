/**
 * 堆是完全二叉树
 * 索引从零开始当前节点的左孩子 2i+1 右孩子 2i+2 ,parent  (i-1）/2
 */
class Heap {
  constructor (arr) {
    this.value = arr
    this.buildMaxHeap()
  }
  // 最大堆下浮
  adjustMaxHeap (arr, index, length) {
    let max = index
    let left = 2 * index + 1
    let right = left + 1

    if (left < length && arr[left] > arr[max]) {
      max = left
    }
    if (right < length && arr[right] > arr[max]) {
      max = right
    }

    if (max !== index) {
      [arr[max], arr[index]] = [arr[index], arr[max]]
      this.adjustMaxHeap(arr, max, length)
    }
  }
  buildMaxHeap () {
    const arr = this.value
    let length = arr.length
    let parent = Math.floor(length / 2 - 1)

    for (let i = parent; i >= 0; i--) {
      this.adjustMaxHeap(arr, i, length)
    }
  }
  /**
   * 从最后面插入元素然后上浮
   */
  add (element) {
    const arr = this.value
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
  /**
 * 直接返回第一个元素,然后将最后面的元素放在第一个位置
 */
  pop () {
    const arr = this.value
    let result = arr[0]
    arr[0] = arr.pop()

    this.adjustMaxHeap(arr, 0, arr.length)

    return result
  }
}

let maxHeap = new Heap([1, 2, 3, 4, 5])

console.log(maxHeap.value)

maxHeap.add(7)
console.log(maxHeap.value)
maxHeap.pop()
console.log(maxHeap.value)
