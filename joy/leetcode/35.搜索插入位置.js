/*
 * @lc app=leetcode.cn id=35 lang=javascript
 *
 * [35] 搜索插入位置
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * 1,3,5,6   2
 * 1,2,3     5
 * 1,2,3     3
 */
// var searchInsert = function(nums, target) {
//     for (let i = 0; i < nums.length; i++) {
//       if (target <= nums[i]) return i
//     }
//     return nums.length
//   }
// 二分查找
// https://wangdoc.com/javascript/operators/bit.html#%E5%8F%B3%E7%A7%BB%E8%BF%90%E7%AE%97%E7%AC%A6
// nums[pos−1]<target≤nums[pos]
var searchInsert = function(nums, target) {
  const n = nums.length
  let left = 0,
    right = n - 1,
    ans = n
  while (left <= right) {
    let mid = ((right - left) >> 1) + left
    if (target <= nums[mid]) {
      ans = mid
      right = mid - 1
    } else {
      left = mid + 1
    }
  }
  return ans
}

// var r = searchInsert([1, 3, 5, 6], 4)
// console.log(r)
// @lc code=end
