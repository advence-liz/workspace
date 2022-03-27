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
function ListNode(val) {
  this.val = val
  this.next = null
}
/**
 * @param {ListNode} head
 * @return {ListNode}
 * pre->a->b
 *  pre ->b->a
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 * pre->1->2->3->4
 * pre->2->1->4->3
 *         pre
 */
// var swapPairs = function(head) {
//   var dummy = new ListNode(-1)
//   dummy.next = head
//   let pre = dummy

//   while (pre.next && pre.next.next) {
//     let node1 = pre.next
//     let node2 = pre.next.next
//     pre.next = node2
//     node1.next = node2.next
//     node2.next = node1
//     pre = node1
//   }

//   return dummy.next
// }
//  pre->1->2->3->4
//  pre->2->1->4->3
//       n2 n1
//          pre

/**
 *
 * @param {*} head
 * 1->2->3->4
 * 2->1->4->3
 */
var swapPairs = function(head) {
  function dsf(head, pre) {
    if (!head || !head.next) {
      return head
    }
    let next = head.next
    head.next = dsf(next.next)
    next.next = head
    return next
  }
  return dsf(head)
}
