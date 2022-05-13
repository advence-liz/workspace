/*
 * @lc app=leetcode.cn id=875 lang=javascript
 *
 * [875] 爱吃香蕉的珂珂
 */

// @lc code=start
/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
var minEatingSpeed = function(piles, h) {

    let left = 0
    let right = Math.max(...piles)

    function canEatAllBananas(piles, H, mid) {
        let h = 0;
        for (let pile of piles) {
          h += Math.ceil(pile / mid);
        }
      
        return h <= H;
      }

    while(left <= right){
        let mid = left+ (left-right) >> 1
        if(canEatAllBananas(piles,h,mid)){
          right = mid -1
        }else{
            left = mid +1
        }
    }
   return left

};
// @lc code=end

