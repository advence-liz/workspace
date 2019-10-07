/*
 * @lc app=leetcode.cn id=242 lang=javascript
 *
 * [242] 有效的字母异位词
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {

    if(s.length !==t.length) return false
    var map = new Map()
    var sArr = s.split('')
    var tArr = t.split('')
    sArr.forEach(str => {
        if (map.has(str)) {
            map.set(str, map.get(str) + 1)
        }else{
            map.set(str, 1)
        }
      
    })
    tArr.forEach(str => {
        var x = map.get(str)
        if (x === undefined) return false

        if (x > 1) { map.set(str, x - 1) }
        if(x===1){map.delete(str)}
    })
    return !map.size
}
// @lc code=end

