
const {ListNode,createLinkList,print} =require('./helper')

// 反转一个单链表。

// 示例:

// 输入: 1->2->3->4->5->NULL
// 输出: 5->4->3->2->1->NULL
// 进阶: 0<-0<-pre->cur->0->0
// 你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
    function dsf(pre,cur){
        if(!cur) return pre
        let next = cur.next
        cur.next = pre
        dsf(cur,next)

      
    }
    return  dsf(null,head)
}

var head = createLinkList([1,2,3,4,5])
var r = reverseList(head)

print(r)