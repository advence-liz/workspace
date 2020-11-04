// 以最大堆为例来实现一波
/**
* @param {number[]} nums
* @param {number} k
* @return {number[]}
*/
class MaxHeap {
    constructor(arr = [], compare = null) {
        this.data = arr
        this.size = arr.length
        this.compare = compare
    }
    getSize() {
        return this.size
    }
    isEmpty() {
        return this.size === 0
    }
    // 增加元素
    add(value) {
        this.data.push(value)
        this.size++
        // 增加的时候把添加的元素进行 siftUp
        this._siftUp(this.getSize() - 1)
    }
    // 找到优先级最高的元素
    findMax() {
        if (this.getSize() === 0)
            return
        return this.data[0]
    }
    // 让优先级最高的元素(即队首元素)出队
    extractMax() {
        // 1.保存队首元素
        let ret = this.findMax()
        // 2.让队首和队尾元素交换位置
        this._swap(0, this.getSize() - 1)
        // 3. 把队尾踢出去，size--
        this.data.pop()
        this.size--
        // 4. 新的队首 siftDown
        this._siftDown(0)
        return ret
    }

    toString() {
        console.log(this.data)
    }
    _swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]]
    }
    _parent(index) {
        return Math.floor((index - 1) / 2)
    }
    _leftChild(index) {
        return 2 * index + 1
    }
    _rightChild(index) {
        return 2 * index + 2
    }
    _siftUp(k) {
        // 上浮操作，只要子元素优先级比父节点大，父子交换位置，一直向上直到根节点
        while (k > 0 && this.compare(this.data[k], this.data[this._parent(k)])) {
            this._swap(k, this._parent(k))
            k = this._parent(k)
        }
    }
    _siftDown(k) {
        // 存在左孩子的时候
        while (this._leftChild(k) < this.size) {
            let j = this._leftChild(k)
            // 存在右孩子而且右孩子比左孩子大
            if (this._rightChild(k) < this.size &&
                this.compare(this.data[this._rightChild(k)], this.data[j])) {
                j++
            }
            if (this.compare(this.data[k], this.data[j]))
                return
            // 父节点比子节点小，交换位置
            this._swap(k, j)
            // 继续下沉
            k = j
        }
    }
}

