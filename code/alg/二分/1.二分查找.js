var arr = [1, 3, 4, 5, 6, 7, 9]
/**
 * 有序 解空间减半
 */
function binarySearch(nums = [], target) {
    let left = 0
    let right = nums.length - 1
    // 闭区间
    while (left <= right) {
        let mid = Math.floor((right - left) / 2) + left
        console.log('mid', mid)
        if (nums[mid] === target) {
            return mid
        }
        // 解空间 [mid+1,right]
        else if (nums[mid] > target) {
            right = mid - 1
        }
        // 解空间 [left,mid-1]
        else {
            left = mid + 1
        }
    }

    return -1
}

let r = binarySearch(arr, 4)

console.log(r)
