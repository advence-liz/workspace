/*
 * @lc app=leetcode.cn id=349 lang=javascript
 *
 * [349] 两个数组的交集
 */

// @lc code=start
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersection = function(nums1, nums2) {

    var s = new Set(nums1)
    var res = []

    for(let n of nums2 ){
       if(s.has(n)){
        res.push(n)
        s.delete(n)
       }
    }
    
    return res

};
// @lc code=end

