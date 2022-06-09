function bs(target, nums = [1, 2, 3, 4, 5, 6, 7]) {
    let left = 0
    let right = nums.length

    while (left <= right) {
        let mid = Math.floor((left + right) / 2)

        if (nums[mid] === target) {
            return mid
        } else if (nums[mid] > target) {
            right = mid - 1
        } else {
            left = mid + 1
        }
    }
    return -1
}
var r = bs(3)
console.log(r)
