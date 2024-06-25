const { ListNode, createLinkList, print } = require('./helper')

// 给定 1->2->3->4, 你应该返回 2->1->4->3.
//     p1 p2
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function(head) {
    if (!head || !head.next) return head
    let p1 = head 
    let p2 = head.next
    p1.next= swapPairs(p2.next)
    p2.next = p1
    return p2
}

var head = createLinkList([1, 2, 3, 4, 5])
var r = swapPairs(head)

print(r)
