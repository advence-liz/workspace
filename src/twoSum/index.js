const random = require('../../util/random')
const { log, info } = console
let arr = [
  random(0, 10),
  random(0, 10),
  random(0, 10),
  random(0, 10),
  random(0, 10)
]
// console.log(arr)
// Example:
// Given nums = [2, 7, 11, 15], target = 9,
//              [2, 7, 11, 15]
// Because nums[0] + nums[1] = 2 + 7 = 9,
// return [0, 1].

function twoSum (arr = [], target) {
  log(arr, target)
  for (let i = 0, len = arr.length; i < len; i++) {
    for (let j = i, len = arr.length; j < len; j++) {
      let sum = arr[i] + arr[j]
      if (sum === target) {
        return [i, j]
      }
    }
  }
  return []
}
log(twoSum([2, 7, 11, 15], 13))
