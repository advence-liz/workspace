function ListNode(val) {
  this.val = val
  this.next = null
}

function createLinkList(arr = [1, 2, 3, 4, 5]) {
  var dummyHead = new ListNode(-1)
  var cur = dummyHead

  arr.forEach(val => {
    cur.next = new ListNode(val)
    cur = cur.next
  })
  return dummyHead.next
}

function print(head) {
  var res = []
  var cur = head
  while (cur) {
    res.push(cur.val)
    cur = cur.next
  }
  console.log(res)
}
module.exports={
  createLinkList,
  print,
  ListNode,
}