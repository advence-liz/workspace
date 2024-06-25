/*
 * @lc app=leetcode.cn id=88 lang=javascript
 *
 * [88] 合并两个有序数组
 */

// @lc code=start
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function (nums1, m, nums2, n) {
    var mIndex = 0
    var nIndex = 0
    var res = []

    while (mIndex < m && nIndex < n) {
        if (nums1[mIndex] < nums2[nIndex]) {
            res.push(nums1[mIndex])
            mIndex++
        } else {
            res.push(nums2[nIndex])
            nIndex++
        }
    }
    while (mIndex < m) {
        res.push[nums1[mIndex]]
        mIndex++
    }

    while (nIndex < n) {
        res.push(nums2[nIndex])
        nIndex++
    }

    for (let i = 0; i < m + n; i++) {
        nums1[i] = res[i]
    }
}
var nums1 = [1, 2, 3, 0, 0, 0]
merge(nums1, 3, [2, 5, 6], 3)
console.log(nums1)

// @lc code=end
