const arr = [1, 3, 8, 7, 6]

function swap(nums, i, j) {
    let temp = nums[i]
    nums[i] = nums[j]
    nums[j] = temp
}
function bubbleSort(nums = []) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < nums.length - i - 1; j++) {
            if (nums[j] > arr[j + 1]) {
                swap(nums, j, j + 1)
                // ;[nums[j], nums[j + 1]] = [nums[j + 1], nums[j]]
            }
        }
    }
    return nums
}

const r = bubbleSort(arr)
console.log(r)
