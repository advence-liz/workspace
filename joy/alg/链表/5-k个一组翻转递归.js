const { ListNode, createLinkList, print } = require('./helper')

// 给定 1->2->3->4, 你应该返回 2->1->4->3.

/**
 * @param {ListNode} head
 * @return {ListNode}
 * 1->2->3->4
 *  0<-0->0->0->0->0
 *  pre
 */
var reverseKGroup = function(head, k) {
  let pre = null
  let cur = head
  let p = head
  for (let i = 0; i < k; i++) {
    if (!p) return head
    p = p.next
  }
  for (let i = 0; i < k; i++) {
    let next = cur.next
    cur.next = pre
    pre = cur
    cur = next
  }
  head.next = reverseKGroup(cur, k)
  return pre
}

let head = createLinkList([1, 2, 3, 4, 5, 6, 7])
let r = reverseKGroup(head, 3)
print(r)
