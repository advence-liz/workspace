/*
 * @lc app=leetcode.cn id=142 lang=javascript
 *
 * [142] 环形链表 II
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var detectCycle = function(head) {

    let m = new Map()

    let cur = head
    let i = 0

    while (cur){
        if(m.has(cur)){
            return cur
        }else{
            m.set(cur,i)
            i++
            cur= cur.next
        }
    }
    return null
    
};
// @lc code=end

