/*
 * @lc app=leetcode.cn id=912 lang=javascript
 *
 * [912] 排序数组
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortArray = function(nums) {
    if (nums.length <= 1) {
        return nums
    } //判断数组，一个长度直接返回

    var pivotIndex = Math.floor(nums.length / 2)

    var pivot = nums.splice(pivotIndex, 1)[0] //找出基准元素
    //  var pivot = nums[0]
    var left = []

    var right = []

    for (var i = 0; i < nums.length; i++) {
        //循环把元素分别放入左边和右边数组

        if (nums[i] < pivot) {
            left.push(nums[i])
        } else {
            right.push(nums[i])
        }
    }
    return sortArray(left).concat([pivot], sortArray(right))
}
// @lc code=end
console.log(sortArray([3, 2, 1, 6, 5, 4, 1, 2, 3]))
