const { ListNode, createLinkList, print } = require('./helper')

// 反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

// 说明:
// 1 ≤ m ≤ n ≤ 链表长度。

// 示例:
// start end
// 输入: 1->2->3->4->5->NULL, m = 2, n = 4
// 输出: 1->4->3->2->5->NULL
// font
// 0--0--0--0

/**
 * @param {ListNode} head
 * @param {number} m
 * @param {number} n
 * @return {ListNode}
 *         3       5
 * 0-->0-->0-->0-->0-->0-->0
 *    pre start   end next
 *
 *  0--0--0--0
 *     pre cur
 */

var reverse = function(cur, pre, tail) {
  let tailNext = tail.next
  while (cur !== tailNext) {
      let next = cur.next
      cur.next = pre
      pre= cur
      cur = next
  }
}
var reverseBetween = function(head, left, right) {
  let dummyHead = new ListNode(-1)
  dummyHead.next = head
  let p = dummyHead
  for (let i = 0; i < left - 1; i++) {
    p = p.next
  }
  let pre = p
  let start = pre.next
  let end = pre

  for (let i = 0; i < right - left + 1; i++) {
    end = end.next
  }
  let next = end.next

//   pre.next = null
//   end.next = null
  reverse(start,pre,end)

  pre.next = end
  start.next = next
  return dummyHead.next
}

var r = reverseBetween(createLinkList([1, 2, 3, 4, 5, 6, 7]), 3, 5)

print(r)
