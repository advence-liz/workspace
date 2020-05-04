
const { ListNode, createLinkList, print } = require('./helper')


/*
 * @lc app=leetcode.cn id=21 lang=javascript
 *
 * [21] 合并两个有序链表
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
var mergeTwoLists = function (l1, l2) {
    if (l1 == null) return l2
    if (l2 == null) return l1
    var dummyHead = new ListNode(-1)
    var cur = dummyHead
    while (l1 && l2) {
        if (l1.val >= l2.val) {
            cur.next = l2
            cur = cur.next
            l2 = l2.next
        }
        else {
            cur.next = l1
            cur = cur.next
            l1 = l1.next
        }

    }
    if (l1) {
        cur.next = l1
    }
    if (l2) {
        cur.next = l2
    }
    print(dummyHead.next)
    return dummyHead.next
}

var l1 = createLinkList([1, 2, 4])
var l2 = createLinkList([1, 3, 4])
mergeTwoLists(l1, l2)