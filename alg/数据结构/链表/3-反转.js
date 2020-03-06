
const {ListNode,createLinkList,print} = require('./helper')

// 反转一个单链表。

// 示例:

// 输入: 1->2->3->4->5->NULL
// 输出: 5->4->3->2->1->NULL
// 进阶:
// 你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

// 递推
/**
 * @param {ListNode} head
 * @return {ListNode}
 *  let pre = head   pre 以head节点开始也行，但是 pre.next 要清空不然会形成环
    let cur = head.next
    pre.next = null  
 */
var reverseList = function (head) {
    if(!head) return 
    let pre = null
    let cur = head

    while(cur){
        let next = cur.next
        cur.next = pre
        pre = cur
        cur = next
    }
    return pre
}
let head = createLinkList([1,2,3,4,5])
var r = reverseList(head)

print(r)