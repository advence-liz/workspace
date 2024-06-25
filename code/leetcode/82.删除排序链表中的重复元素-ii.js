/*
 * @lc app=leetcode.cn id=82 lang=javascript
 *
 * [82] 删除排序链表中的重复元素 II
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
 * @return {ListNode}
 * 1->2->3->3->4->5
 */
var deleteDuplicates = function(head) {
  if (head == null) return null
  let dummy = new ListNode(-1)
  dummy.next = head

  let pre = dummy
  let cur = head
  while (cur && cur.next) {
    if (cur.val === cur.next.val) {
      let val = cur.val
      while (cur && cur.val === val) {
        cur = cur.next
      }
      pre.next = cur
    } else {
      pre = cur
      cur = cur.next
    }
  }
  return dummy.next
}
// @lc code=end
