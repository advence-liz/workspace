/*
 * @lc app=leetcode.cn id=86 lang=javascript
 *
 * [86] 分隔链表
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
 * @param {number} x
 * @return {ListNode}
 */
var partition = function(head, x) {
  let small = new ListNode()
  let smallHead = small
  let large = new ListNode()
  let largeHead = large
  let cur = head
  while (cur) {
    if (cur.val < x) {
      small.next = cur
      small = small.next
    } else {
      large.next = cur
      large = large.next
    }
    cur = cur.next
  }
  large.next = null
  small.next = largeHead.next

  return smallHead.next
}
// @lc code=end
