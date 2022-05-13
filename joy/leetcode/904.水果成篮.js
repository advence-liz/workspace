/*
 * @lc app=leetcode.cn id=904 lang=javascript
 *
 * [904] 水果成篮
 */

// @lc code=start
/**
 * @param {number[]} fruits
 * @return {number}
 */
var totalFruit = function(fruits) {
<<<<<<< HEAD
    let m = new Map()
    let left = 0
    let len = fruits.length
    let ans = 0

    for (let right = 0; right < len; right++) {
        let rc = fruits[right]
        m.set(rc, m.has(rc) ? m.get(rc) + 1 : 1)

        while (m.size > 2) {
            let lc = fruits[left]
            m.set(lc, m.get(lc) - 1)

            if (m.get(lc) === 0) {
                m.delete(lc)
            }
            left++
        }

        ans = Math.max(ans, right - left + 1)
    }
    return ans
}
// @lc code=end
=======

};
// @lc code=end

>>>>>>> cd1b90c1fc2f7f283ee2b56e58af5746615bae87
