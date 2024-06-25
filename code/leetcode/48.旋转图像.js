/*
 * @lc app=leetcode.cn id=48 lang=javascript
 *
 * [48] 旋转图像
 */

// @lc code=start
/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 * [
 * [x0y0,x1y0,x2y0]
 * [x0y1,x1y1,x2y1]
 * [x0y2,x1y2,x2y2]
 * ]
 * [x0y2 x0y1 x0y0
 *  x1y2 x1y1 x1y0
 *  x2y2 x2y1 x2y0
 * ]
 * x0y0
 *
 * x5
 */
var rotate = function(matrix) {
  var xlen = matrix[0].length
  var ylen = matrix.length

  for (var x = 0; x < xlen; x++) {}
}
// @lc code=end
