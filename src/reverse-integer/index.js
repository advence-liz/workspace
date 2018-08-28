console.log('_demo')

function reverseInteger (interger) {
  let operate
  let arr = interger.toString().match(/\d/g)
  let result = ''
  operate = interger < 0 ? -1 : 1

  result = arr.reduce((pre, next) => {
    return next + pre
  })
  return parseInt(result, 10) * operate
}
console.log(reverseInteger(123))

console.log(reverseInteger(-123))
