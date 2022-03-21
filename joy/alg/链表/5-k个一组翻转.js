const { ListNode, createLinkList, print } = require('./helper')

// 给定 1->2->3->4, 你应该返回 2->1->4->3.

/**
 * @param {ListNode} head
 * @return {ListNode}
 * 1->2->3->4
 *  0<-0->0->0->0->0
 *  pre
 */
// var reverseKGroup = function(head, k) {
//     let pre = null
//     let cur = head
//     let p = head
//     for (let i = 0; i < k; i++) {
//         if (!p) return head
//         p = p.next
//     }
//     for (let i = 0; i < k; i++) {
//         let next = cur.next
//         cur.next = pre
//         pre = cur
//         cur = next
//     }
//     head.next = reverseKGroup(cur, k)
//     return pre
// }

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
  const dummy = new ListNode(0)
  dummy.next = head
  let pre = dummy
  let tail = pre
  while (head) {
    // 查看剩余部分长度是否大于等于 k
    for (let i = 0; i < k; i++) {
      tail = tail.next
      if (!tail) {
        return dummy.next
      }
    }
    const next = tail.next
    ;[head, tail] = myReverse(head, tail)
    // 把子链表重新接回原链表
    pre.next = head
    tail.next = next
    pre = tail
    head = tail.next
  }
  return dummy.next
}

let head = createLinkList([1, 2, 3, 4, 5, 6, 7])
let r = reverseKGroup(head, 3)
print(r)
