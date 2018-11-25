const { log } = console
function twoSum (nums = [], target) {
  const len = nums.length
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      let sum = nums[i] + nums[j]
      if (sum === target) {
        return [i, j]
      }
    }
  }
  return []
}
log(twoSum([2, 7, 11, 15], 13))
