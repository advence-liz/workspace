/*
 * @lc app=leetcode.cn id=203 lang=javascript
 *
 * [203] 移除链表元素
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} val
 * @return {ListNode}
 * d - 1 - 2 - 6 - 6
 *         p   n
 */
var removeElements = function(head, val) {
    let dummy = new ListNode(-1, head)

    let prev = dummy

    while (prev) {
        if (prev.next.val === val) {
            prev.next = prev.next.next
        } else {
            prev = prev.next
        }
    }
    return dummy.next
}
// @lc code=end
