
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
var head = createLinkList()

function print(head) {
  var res = []
  var cur = head
  while (cur) {
    res.push(cur.val)
    cur = cur.next
  }
  console.log(res)
}

// 反转一个单链表。

// 示例:

// 输入: 1->2->3->4->5->NULL
// 输出: 5->4->3->2->1->NULL
// 进阶:
// 你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {

  
  function reverse(pre,cur){
    if(!cur) return pre
    var next = cur.next
    cur.next = pre
    return reverse(cur,next)
  }

  return  reverse(null,head)

}

var r = reverseList(head)

print(r)