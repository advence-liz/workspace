
/*
 * @lc app=leetcode.cn id=239 lang=javascript
 *
 * [239] 滑动窗口最大值
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */


// var maxSlidingWindow = function (nums, k) {
//     if (!nums.length) return []
//     var result = []
//     var i = 0
//     while (i < nums.length - k +1) {
//         console.log('i', i, 'k', k)
//         result.push(Math.max(...nums.slice(i, i + k)))
//         i++
//     }
//     console.log(result)
//     return result



// }
function getLast(arr) {
    return arr[arr.length - 1]
}
function getFirst(arr) {
    return arr[0]
}
/**
 * 
 * @param {*} nums 
 * @param {*} k 
 * @description
 * 问题分为俩个阶段：
 * 1. 填满双向队列，填充方式是后一个元素「连续」跟前一个元素比较，若前一个元素小则弹出，继续跟前前元素比较...,即队列的特性是里面的值是递减的即第一个元素最大
 * 2. 增加一个元素重新计算队列中最大值，2.1 如 1 的方式填充元素，并且去掉超出窗口范围的元素
 * 
 */
var maxSlidingWindow = function (nums, k) {

    if (!nums.length || k < 1) return []
    var result = []
    // idx 双向队列存储下标,存储下标才能判断是否已经超出窗口范围
    var idx = []
    // 填满第一个窗口
    for (let i = 0; i < k; i++) {
        while (idx.length && nums[i] >= nums[getLast(idx)]) {
            idx.pop()
        }
        idx.push(i)
    }
    result.push(nums[getFirst(idx)])
    //
    for (let i = k; i < nums.length; i++) {
       
        while (idx.length && nums[i] >= nums[getLast(idx)]) {
            idx.pop()
        }
        while (idx.length && getFirst(idx) <= i - k) {
            idx.shift()
        }
        idx.push(i)
        result.push(nums[getFirst(idx)])
    }
    return result

}
// [1,3,-1,-3,5,3,6,7]
// 2 [3]
// 3 [3,-3]
// 4 [5]
// 5 [5,3]
// 6 [6]
// 7 [6,7]

// var arr = [1, 3, -1, -3, 5, 3, 6, 7]
// maxSlidingWindow(arr, 3)
//[3,3,5,5,6,7]
// @lc code=end


