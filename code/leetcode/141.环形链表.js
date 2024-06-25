/*
 * @lc app=leetcode.cn id=141 lang=javascript
 *
 * [141] 环形链表
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
 * @return {boolean}
 */
// var hasCycle = function(head) {
//   var s = new Set()

//   var cur = head

//   while(cur){
//     if (s.has(cur.val)) return true

//     s.add(cur.val)

//     cur = cur.next
//   }
//   return false
// }

var hasCycle = function(head) {
  if (!head || !head.next) return false
  let fast = head.next
  let slow = head

  while (fast.next && fast.next.next) {
    if (fast === slow) {
      return true
    }
    fast = fast.next.next
    slow = slow.next
  }
  return false
}
// @lc code=end

// var hasCycle = function(head) {
//     if (!head || !head.next) return false

//     var fast = head.next
//     var slow = head
//     // fast.val !== slow.val
//     while (fast !== slow) {
//       if (!fast || !fast.next) return false
//       fast = fast.next.next
//       slow = slow.next
//     }
//     return true
//   }
