console.log(module.i)
const arr = [8, 4, 5, 7, 1, 3, 6, 2]

/**
 * @param {number[]} digits
 * @return {number[]}
 */
var plusOne = function(digits) {
  let len = digits.length
  let num = digits[len - 1]
  if (len === 1) {
    if (num < 9) {
      return [num + 1]
    } else {
      return [1, 0]
    }
  }
  if (num < 9) {
    return [...digits.slice(0, -1), num + 1]
  } else {
    return [...plusOne(digits.slice(0, -1)), 0]
  }
}
console.log(plusOne([1, 2, 3]))

var c = 1
var b = c + 1
