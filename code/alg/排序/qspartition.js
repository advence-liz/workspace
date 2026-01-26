function quickSort(nums, left, right) {
    if (left >= right) {
        return nums
    }

    let partitionIndex = partition(nums, left, right)

    quickSort(nums, left, partitionIndex - 1)
    quickSort(nums, partitionIndex + 1, right)
}

function swap(i, j, arr) {
    let temp = arr[j]

    arr[i] = arr[j]
    arr[j] = temp
}

function partition(nums, left, right) {
    const povit = nums[right]

    let storedIndex = left

    for (let i = left; i <= right; i++) {
        if (nums[i] < povit) {
            swap(i, storedIndex, nums)
            storedIndex++
        }
    }
    swap(storedIndex, right, nums)
    return storedIndex
}
