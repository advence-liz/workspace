/*
 * @lc app=leetcode.cn id=206 lang=javascript
 *
 * [206] 反转链表
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
 */
var reverseList = function (head) {
  var pre = null

  var cur = head

  while (cur) {
    // var [cur.next,cur,pre]=[pre,cur.next,cur]
    var next = cur.next
    cur.next = pre
    pre = cur
    cur = next
  }
  return pre
}
