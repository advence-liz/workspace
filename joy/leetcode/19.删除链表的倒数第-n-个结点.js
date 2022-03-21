/*
 * @lc app=leetcode.cn id=19 lang=javascript
 *
 * [19] 删除链表的倒数第 N 个结点
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
 * @param {number} n
 * @return {ListNode}
 * 1->2->3->4->5
 */
var removeNthFromEnd = function(head, n) {
  let dummy = new ListNode()
  dummy.next = head
  let fast = dummy
  let slow = dummy

  for (let i = 0; i < n; i++) {
    fast = fast.next
  }
  // 终止条件 看下面逻辑用到的最远的节点
  while (fast.next) {
    fast = fast.next
    slow = slow.next
  }
  slow.next = slow.next.next
  return dummy.next
}
// @lc code=end
