//          0  1  2  3  4  5  6
var nums = [1, 7, 3, 6, 5, 6]
//          1  2  3  4  5  6  7
// preSum[i] 0~i-1

function pivotIndex(nums) {
  let preSum = [0]
  for (let i = 0; i < nums.length; i++) {
    preSum[i + 1] = nums[i] + preSum[i]
  }

  for (let j = 0; j < nums.length; j++) {
    if (preSum[j] === preSum[nums.length] - preSum[j + 1]) {
      return j
    }
  }
  return -1
}

var r = pivotIndex(nums)

console.log(r)

// nums
let preSum = [0]
for (let i = 0; i < nums.length; i++) {
  preSum[i + 1] = preSum[i] + nums[i]
}
