function ListNode(val) {
  this.val = val
  this.next = null
}
/**
 *
 * @param {*} arr 链表源数组
 * @description
 * createLinkList([1, 2, 3, 4, 5])
 * 1->2->3->4->5
 * createLinkList([1, 2, 3, 4, 5, 3]) 形成环
 * 1->2->3->4->5->3->4->5->3->4->5->3->4->5->3...
 */
function createLinkList(arr = [1, 2, 3, 4, 5]) {
  var dummyHead = new ListNode(-1)
  var cur = dummyHead
  var m = new Map()
  var pos = -1 // 链表环起点位置
  var len = 0
  arr.forEach(val => {
    if (m.has(val)) {
      pos = arr.indexOf(val)
      len = arr.length - pos - 1
      cur.next = m.get(val)
    } else {
      m.set(val, new ListNode(val))
      cur.next = m.get(val)
    }
    cur = cur.next
  })
  let max = arr.length + len
  print(dummyHead.next, max)
  return dummyHead.next
}

function print(head, max = 30) {
  var res = []
  var cur = head
  var size = 0
  while (cur && size < max) {
    res.push(cur.val)
    cur = cur.next
    size++
  }
  // if (size === max) res.push('...')
  console.log(res.join('->'))
}
module.exports = {
  createLinkList,
  print,
  ListNode
}
