/*
 * @lc app=leetcode.cn id=70 lang=javascript
 *
 * [70] 爬楼梯
 */

// @lc code=start
/**
 * @param {number} n
 * @return {number}
 * @description
 * f(n) = f(n-1) + f(n-2)
 * f(0) = 0
 * f(1)= 1
 * f(2) = 2
 * f(3) = 3 111 12 21
 * f(4) =  1111 121  211  112 22
 */

// var climbStairs = function(n) {
//   if (n === 0) return 0

//   if (n === 1) return 1

//   if (n === 2) return 2

//   return climbStairs(n - 1) + climbStairs(n-2)
// }

var climbStairs = function(n) {
  var p1 = 1
  var p2 = 2
  var pn = -1
  if (n === 0) return 0

  if (n === 1) return p1

  if (n === 2) return p2

  while (n > 2) {
    pn = p1 + p2
    p1 = p2
    p2 = pn
    n--
  }
  return pn
}
// @lc code=end
