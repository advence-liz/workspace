var BigNumber = require('big-number')

var n = BigNumber(5)
    .plus(97)
    .minus(53)
    .plus(434)
    .multiply(5435423)
    .add(321453)
    .multiply(21)
    .mod(222)
// .div(2)
// .pow(2)
// 760056543044267246001
console.log(n.val())

var c = BigNumber(0.355).div(10)
console.log(c.val())
