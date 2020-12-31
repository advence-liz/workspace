/*
 * @lc app=leetcode.cn id=2 lang=javascript
 *
 * [2] 两数相加
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
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {

    var p = new ListNode(-1)
    var cur = p
    var carry = 0

    while (l1 || l2 ||carry) {

        var l1v = l1 ? l1.val : 0
        var l2v = l2 ? l2.val : 0
        var sum = l1v + l2v + carry
        if (sum > 9) {
            cur.next = new ListNode(sum % 10)
            carry = 1
        } else {
            cur.next = new ListNode(sum)
            carry = 0
        }
        cur = cur.next
        l1 = l1 && l1.next
        l2 = l2 && l2.next

    }
    // if (l1) {
    //     p.next = l1
    // }
    // if (l2) {
    //     p.next = l2
    // }
    return p.next
}
// @lc code=end

