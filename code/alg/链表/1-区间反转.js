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

// 反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

// 说明:
// 1 ≤ m ≤ n ≤ 链表长度。

// 示例:
// start end
// 输入: 1->2->3->4->5->NULL, m = 2, n = 4
// 输出: 1->4->3->2->5->NULL
// font

// 输入: 1->2->3->4->5->NULL
// pre =2 cur = 3 反转两次
// 1->2<-3<-4  5
// f
/**
 * @param {ListNode} head
 * @param {number} m
 * @param {number} n
 * @return {ListNode}
 * 0->0->0->0->0->0->0
 *    a  b     c  d
 */
var reverseBetween = function (head, m, n) {

    var dummyHead = new ListNode(-1)
    dummyHead.next = head
    var p = dummyHead
    // 移动到前节点
    for (var i = 0; i < m - 1; i++) {
        p = p.next
    }
    // front 前节点 start 区间开始节点 pre 最终会变成区间结束节点 cur 最终会变成后节点
    // a 
    var front, pre, start, cur
    front = p
    start = pre = p.next
    cur = pre.next

    for (var j = 0; j < n - m; j++) {
        var next = cur.next
        cur.next = pre
        pre = cur
        cur = next
    }

    front.next = pre
    start.next = cur

    return dummyHead.next

}
var r = reverseBetween(head, 2, 4)

print(r)