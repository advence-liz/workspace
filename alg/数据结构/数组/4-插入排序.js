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
    //n-1此扫描，依次向前插入n-1个元素
    //每趟将nums[i]插入到前面的排序子序列中
    for (let i = 1; i < nums.length; i++) {
        let cur = nums[i]
        let j = i - 1
        console.group(i)
        // for (; j >= 0; j--) {
        //     if (nums[j] > cur){
        //         console.log(`nums[${j + 1}] = nums[${j}]`)
        //         nums[j + 1] = nums[j]
        //     }
        // }
        while (j >= 0 && nums[j] > cur) {
            console.log(`nums[${j + 1}] = nums[${j}]`)
            nums[j + 1] = nums[j]
            j--
        }
        nums[j + 1] = cur
        console.groupEnd(i)
    }
    console.log(nums)
    return nums
}
// @lc code=end
sortArray([3, 2, 1, 6, 5, 4, 1, 2, 3])
