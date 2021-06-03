var nums = [0, 1, 2, 2, 3, 4]
let k = 3
let m = {}
let ans = 0

for (let i = 0; i < nums.length; i++) {
  let i_k = nums[i] - k
  ans += ~~m[i_k]
  m[i] = ~~m[i] + 1
}

console.log(ans)

/**
 *
 * 这个前缀和数组 preSum 的含义也很好理解，preSum[i] 就是 nums[0..i-1] 的和。
 * 那么如果我们想求 nums[i..j] 的和，只需要一步操作 preSum[j+1]-preSum[i] 即可，
 * 而不需要重新去遍历数组了。
 */

function getPresum(nums) {
  var preSum = [0]
  for (var i = 0; i < nums.length; i++) {
    preSum[i + 1] = preSum[i] + nums[i]
  }
  return preSum
}
