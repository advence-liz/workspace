function sort(nums, l, h) {
    let p = partition(nums, l, h)

    sort(nums, l, p - 1)
    sort(nums, p + 1, h)
}

function partition(nums, l, h) {
    let p = nums[l]

    w
}
