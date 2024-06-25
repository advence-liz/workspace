const { ListNode, createLinkList, print } = require('./helper')

// 给定 1->2->3->4, 你应该返回 2->1->4->3.

/**
 * @param {ListNode} head
 * @return {ListNode}
 * 1->2->3->4
 *   dummy->0->0->0->0->0->0
 *     pre head
 */

const myReverse = (head, tail) => {
  let cur = head
  let pre = null
  while (pre !== tail) {
    const next = cur.next
    cur.next = pre
    pre = cur
    cur = next
  }
  return [tail, head]
}
var reverseKGroup = function(head, k) {
  let dummy = new ListNode(-1)
  dummy.next = head
  let pre = dummy
  let tail = dummy

  while (head) {
    for (let i = 0; i < k; i++) {
      tail = tail.next
      if (!tail) {
        return dummy.next
      }
    }
  }
  let next = tail.next
  ;[head, tail] = myReverse(head, tail)

  pre.next = head
  tail.next = next

  pre = tail
  head = tail.next

  return dummy.next
}

let head = createLinkList([1, 2, 3, 4, 5, 6, 7])
let r = reverseKGroup(head, 3)
print(r)
