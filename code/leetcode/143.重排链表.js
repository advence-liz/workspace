/*
 * @lc app=leetcode.cn id=143 lang=javascript
 *
 * [143] 重排链表
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
 * @return {void} Do not return anything, modify head in-place instead.
 * 1->2->3>->4
 * 4->3->2->1
 */
function findMid(head) {
    let slow = head
    let fast = head

    while (fast.next && fast.next.next) {
        slow = slow.next
        fast = fast.next.next
    }

    return slow
}

function reverse(head) {
    let pre = null
    let cur = head
    while (cur) {
        let next = cur.next
        cur.next = pre
        pre = cur
        cur = next
    }

    return pre
}

function merge(l1, l2) {
    while (l1 && l2) {
        let l1Next = l1.next
        let l2Next = l2.next

        l1.next = l2
        l2.next = l1Next
        l1 = l1Next
        l2 = l2Next
    }
}

var reorderList = function(head) {
    let mid = findMid(head)
    let l1 = head
    let l2 = mid.next
    mid.next = null
    l2 = reverse(l2)
    merge(l1, l2)
}
// @lc code=end
