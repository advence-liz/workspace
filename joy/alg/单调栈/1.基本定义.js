/**
 * 简单的例子：
 * 题目是这样的，给一个数组，返回一个大小相同的数组。
 * 返回的数组的第i个位置的值应当是，对于原数组中的第i个元素，至少往右走多少步，
 * 才能遇到一个比自己大的元素（如果之后没有比自己大的元素，或者已经是最后一个元素，
 * 则在返回数组的对应位置放上-1
 * input: 5,3,1,2,4
 * return: -1 3 1 1 -1
 */

class Stack {
    constructor() {
        this.items = []
    }
    // 新增元素
    push(el) {
        this.items.push(el)
    }
    // 删除栈顶的元素并返回其值
    pop() {
        return this.items.pop()
    }
    // 返回栈顶的元素
    peek() {
        return this.items[this.items.length - 1]
    }
    // 清空栈
    clear() {
        this.items = []
    }
    // 栈的大小
    size() {
        return this.items.length
    }
    // 栈是否为空
    isEmpty() {
        return this.items.length === 0
    }
}

function nextExceed(nums = [5, 3, 1, 2, 4]) {
    let ans = new Array(nums.length).fill(-1)
    let stack = new Stack()
    for (let i = 0; i < nums.length; i++) {
        while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
            ans[stack.peek()] = i - stack.peek()
            stack.pop()
        }
        stack.push(i)
    }
    return ans
}
var r = nextExceed()
console.log(r)
