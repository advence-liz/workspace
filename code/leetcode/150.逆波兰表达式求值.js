/*
 * @lc app=leetcode.cn id=150 lang=javascript
 *
 * [150] 逆波兰表达式求值
 */

// @lc code=start
/**
 * @param {string[]} tokens
 * @return {number}
 * ["4","13","5","/","+"]
 * (4 + (13 / 5)) = 6
 * stack 4
 * stack 13
 * stack 5
 * stack 4 13/5
 *
 * ["2","1","+","3","*"]
 * （(2+1)*3）
 *2 1 +
 *
 *2+1 3
 */
var evalRPN = function(tokens) {
  var str = ''
  var stack = []
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token === '/') {
      let x = stack.pop()
      let y = stack.pop()
      str += `${y}/${x}`
      stack.push(Math.floor(y / x))
    } else if (token === '*') {
      let x = stack.pop()
      let y = stack.pop()
      str += `${y}*${x}`
      stack.push(y * x)
    } else if (token === '+') {
      let x = stack.pop()
      let y = stack.pop()
      str += `${y}+${x}`
      stack.push(y + x)
    } else if (token === '-') {
      let x = stack.pop()
      let y = stack.pop()
      str += `${y}-${x}`
      stack.push(y - x)
    } else {
      stack.push(~~token)
    }
  }
  let ans = stack.pop()
  return ans
}

evalRPN(['4', '13', '5', '/', '+'])
// @lc code=end
