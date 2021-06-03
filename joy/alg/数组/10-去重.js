var removeDuplicates = function(nums) {
    let l = 0
    let r = 1

    while (r < nums.length) {
        r++

        if (nums[l] !== nums[r]) {
           
            l++
            nums[l] = nums[r]
        }
    }
    return nums
}

var r = removeDuplicates([1, 1, 1,1,2])

console.log(r)
