// 给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

// 示例:

// 输入: [0,1,0,3,12]
// 输出: [1,3,12,0,0]
// 说明:

// 必须在原数组上操作，不能拷贝额外的数组。
// 尽量减少操作次数。
// 相关标签
// 数组
// 双指针
/**
 * [0,1,0,3,12]
 *
 * 1,1,0,3,12
 * 1,3,0,3,12
 * 1,3,12,3,12
 *
 * 1,0,0,3,12
 * 1,3,0,0,12
 * 1,3,12,0,0
 *
 */

/**
 * https://leetcode-cn.com/problems/move-zeroes/solution/dong-hua-yan-shi-283yi-dong-ling-by-wang_ni_ma/
 * @param {number[]} nums [0,1,0,3,12]
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) {
  var left = 0
  for (var i = 0; i < nums.length; i++) {
    var rv = nums[i]
    if (rv !== 0) {
      nums[left] = rv
      left++
    }
  }
  return nums
}

function swap(x, y, nums) {
  var tmp = nums[x]
  nums[x] = nums[y]
  nums[y] = tmp
}

var r = moveZeroes([0, 1, 0, 3, 12])
console.log(r)

// var moveZeroes = function(nums) {
//   var left = 0
//   for (var i = 0; i < nums.length; i++) {
//     var rv = nums[i]
//     if (rv !== 0) {
//       swap(left, i, nums)
//       left++
//     }
//   }
//   return nums
// }
