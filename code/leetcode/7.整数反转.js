/*
 * @lc app=leetcode.cn id=7 lang=javascript
 *
 * [7] 整数反转
 */

// @lc code=start
/**
 * @param {number} x
 * @return {number}
 * 123
 */
var reverse = function(x) {
    let n = 0

    while(x!==0){
        n = n*10 + x%10
        x = parseInt(x/10) 
    }
    return n
  
};
// @lc code=end

