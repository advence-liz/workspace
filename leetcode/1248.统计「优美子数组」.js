/*
 * @lc app=leetcode.cn id=1248 lang=javascript
 *
 * [1248] 统计「优美子数组」
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 * 1,1,2,1,1   5 -3 =2
 */
// var numberOfSubarrays = function(nums, k) {
//     let res = 0

//     for (let i = 0; i <= nums.length - k; i++) {
//         let count =0
//         for (let j = i; j < nums.length; j++) {

//             if(nums[j]%2) count++
//             if(count ===k) {
//                 res++

//             }else if(count>k){
//                 break
//             }

//         }
//     }
//     console.log(res)
//     return res
// }

// var numberOfSubarrays = function(nums, k) {
//     let res = 0
//     let count = nums[0] % 2 ? 1 : 0
//     let left = 0
//     let right = 0

//     while (right < nums.length&& left<=nums.length-k) {
//         right++
//         if(nums[right]%2) count++

//         if(count===k){
//             res++
//             if(count>k){
//                 if(nums[left]) count--
//                 left++
//             }

//         }
//     }
//     console.log(res)
//     return res
// }

var numberOfSubarrays = function(nums, k) {
    let preSum = [0]
    let ans = 0
    let m = {}
    for (let i = 0; i < nums.length; i++) {
        let cur = nums[i] % 2 ? 1 : 0
        preSum[i + 1] = preSum[i] + cur
    }
    console.log(preSum)
    // 前序和是递增的
    for (let x of preSum) {
        ans = ans + ~~m[x - k]
        m[x] = ~~m[x] + 1
    }
    console.log(ans)
    return ans
}

numberOfSubarrays([2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2)
// @lc code=end
