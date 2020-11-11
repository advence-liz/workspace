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
//[1,2,3,4,5]
function reverseList(head, m = 2, n = 4) {
    if (!head) return null
  
    //   var dummyHead =new ListNode(-1)
    //   dummyHead.next = head
  
    var pre = head.next
    var start = head.next
    var cur = head.next.next
  
    while (cur) {
        var next = cur.next
        cur.next = pre
        pre = cur
        cur = next
    }
    start.next = null
    print(head)
    print(pre)
    return pre
}
reverseList(head)
  