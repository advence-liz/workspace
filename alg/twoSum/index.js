const { log } = console
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
