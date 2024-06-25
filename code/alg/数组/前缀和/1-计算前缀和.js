// eslint-disable-next-line no-unused-vars
var preSum = [0]
var nums = [1,3,4,5,6]
for (let i = 0; i < nums.length; i++) {
  preSum[i + 1] = nums[i] + preSum[i]
}

console.log(preSum)