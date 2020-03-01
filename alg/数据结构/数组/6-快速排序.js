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

    var left = []
    var right = []

    // for(var i =0;i< nums.length;i++){
    //     if(nums[i]<pivot){
    //         left.push(nums[i])
    //     }else{
    //         right.push(nums[i])
    //     }
    // }

    while (nums.length) {
        var cur = nums.shift()
        
        if (cur < pivot) {
            left.push(cur)
        } else {
            right.push(cur)
        }
    }
    return [...sortArray(left), pivot, ...sortArray(right)]
}
// @lc code=end
console.log(sortArray([3, 2, 1, 6, 5, 4, 1, 2, 3]))
