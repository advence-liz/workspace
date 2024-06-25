/*
 * @lc app=leetcode.cn id=1 lang=javascript
 *
 * [1] 两数之和
 */
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  var map = new Map()

  for (let i = 0; i < nums.length; i++) {
    const currentValue = nums[i]
    const currentTarget = target - currentValue

    if (map.has(currentTarget)) {
      return [map.get(currentTarget), i]
    }
    map.set(currentValue, i)
  }
}
// twoSum([2, 7, 11, 15], 9)
