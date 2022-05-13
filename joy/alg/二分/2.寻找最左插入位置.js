// 上面我们讲了寻找满足条件的值。如果找不到，就返回 -1。那如果不是返回 -1，而是返 回应该插入的位置，使得插入之后列表仍然有序呢？
// 比如一个数组 nums: [1,3,4]，target 是 2。我们应该将其插入（注意不是真的插入）的 位置是索引 1 的位置，
// 即 [1,2,3,4]。因此寻找最左插入位置应该返回 1， 而寻找满足条件的位置 应该返回-1。
// 另外如果有多个满足条件的值，我们返回最左侧的。
// 比如一个数组 nums: [1,2,2,2,3,4]，target 是 2，我们应该插入的位置是 1。

/**
 *  target 2
 *  1, 2, 2, 2, 3, 4 ,5 ,6 , 7
 *
 * 最左闭区间不断收缩 right 
 * 开区间
 * 
 */

function binaryInsertLeft(nums, target) {
    let left = 0
    let right = nums.length - 1

    while (left <= right) {
        let mid = left + Math.floor((right - left) / 2)
        if (nums[mid] >= target) {
            right = mid - 1
        } else {
            left = mid + 1
        }
    }
    return left
}

let r = binaryInsertLeft([1, 2, 2, 2, 3, 4], 2)
console.log(r)
