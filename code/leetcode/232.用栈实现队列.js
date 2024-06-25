/*
 * @lc app=leetcode.cn id=232 lang=javascript
 *
 * [232] 用栈实现队列
 */

// @lc code=start

var MyQueue = function() {
    this.stack = []
    this.helperStack = []
}

/**
 * @param {number} x
 * @return {void}
 */
MyQueue.prototype.push = function(x) {
    let cur = null
    while ((cur = this.stack.pop())) {
        this.helperStack.push(cur)
    }
    this.helperStack.push(x)

    while ((cur = this.helperStack.pop())) {
        this.stack.push(cur)
    }
}

/**
 * @return {number}
 */
MyQueue.prototype.pop = function() {
    this.stack.pop()
}

/**
 * @return {number}
 */
MyQueue.prototype.peek = function() {
    return this.stack[this.stack.length - 1]
}

/**
 * @return {boolean}
 */
MyQueue.prototype.empty = function() {
    this.stack.length = 0
}

/**
 * Your MyQueue object will be instantiated and called as such:
 * var obj = new MyQueue()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.peek()
 * var param_4 = obj.empty()
 */
// @lc code=end
