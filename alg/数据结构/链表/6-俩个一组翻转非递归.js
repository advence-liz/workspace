const { ListNode, createLinkList, print } = require('./helper')

// 给定 1->2->3->4, 你应该返回 2->1->4->3.
//    p1  p2
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function(head) {
    if (!head && head.next) return head
    let dummyHead, pre
    dummyHead = pre = new ListNode(-1)
    dummyHead.next = head
    let p1, p2

    while ((p1 = pre.next) && (p2 = pre.next.next)) {
        p1.next = p2.next
        p2.next = p1
        pre.next = p2
        pre = p1
    }
    return dummyHead.next
}

var head = createLinkList([1, 2, 3, 4, 5])
var r = swapPairs(head)

print(r)
