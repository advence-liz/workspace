/*
 * @lc app=leetcode.cn id=739 lang=javascript
 *
 * [739] 每日温度
 */

// @lc code=start
/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function Stack() {
  this.store = []
  this.push = function(...rest) {
    this.store.push(...rest)
  }
  this.pop = function() {
    this.store.pop()
  }
  this.top = function() {
    return this.store[this.store.length - 1]
  }
  this.length = function() {
    this.store.length
  }
}
var dailyTemperatures = function(temperatures) {
  var s = new Stack()
  var ans = new Array(temperatures.length).fill(0)

  for (var i = 0; i < temperatures.length; i++) {
    var temperature = temperatures[i]
    while (s.length && temperature > temperatures[s.top()]) {
     var top = s.top()
      ans[top] = i - top
      s.pop()
    }
    s.push(i)
  }
  return ans
}
// @lc code=end
