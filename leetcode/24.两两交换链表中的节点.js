/*
 * @lc app=leetcode.cn id=24 lang=javascript
 *
 * [24] 两两交换链表中的节点
 */
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
 * pre->a->b
 *  pre ->b->a
 */
var swapPairs = function (head) {
  var ln = new ListNode(-1)
  ln.next = head
  var pre = ln
  while (pre.next && pre.next.next) {
    var a = pre.next
    var b = pre.next.next

    a.next = b.next
    b.next = a
    pre.next = b
    pre = pre.next.next
  }
  return ln.next
}
