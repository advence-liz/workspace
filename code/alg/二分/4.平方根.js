/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {
    let left = 0
    let right = x
    let ans = -1

    while (left <= right) {
        let mid = left + Math.floor((right - left) / 2)

        if (mid * mid > x) {
            right = mid - 1
        } else {
            ans = mid
            left = mid + 1
        }
    }
    return ans
}
var r = mySqrt(8)
console.log(r)
