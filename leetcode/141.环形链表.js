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

var hasCycle = function (head) {

    var fast, slow, p
    p = new ListNode(-1)
    p.next = head
    fast = slow = p

    while (fast.next && fast.next.next) {
        fast = fast.next.next
        slow = slow.next

        if (fast.val === slow.val) {
            return true
        }
    }
    return false
}
// @lc code=end

