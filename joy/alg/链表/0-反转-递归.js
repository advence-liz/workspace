const { ListNode, createLinkList, print } = require('./helper')

// 反转一个单链表。

// 示例:

// 输入: 1->2->3->4->5->NULL
// 输出: 5->4->3->2->1->NULL
// head->0->0->0
// 进阶: 0<-0<-pre->cur->0->0
// 你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

/**
 * @param {ListNode} head
 * @return {ListNode}
 *  pre  2 1   345
 *         pre cur
 */
var reverseList = function(head) {
    // 前序假设前面已经做好
    function dfs(pre, cur) {
        if (!cur) return pre
        let next = cur.next
        cur.next = pre
        return dfs(cur, next)
    }
    return dfs(null, head)
}

var head = createLinkList([1, 2, 3, 4, 5])
var r = reverseList(head)

print(r)


var reverseList = function(head) {
    if (head == null || head.next == null) return head;
    let last = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return last;
};

 1 2 3 4 5 
 head

var reverseList = function(head) {
    if (head == null || head.next == null) return head;
    let last = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    return last;
};

1 5 4 3 2 1
1 2 3     54
    head next
  
var reverseList = function(head,next) {
    if (head == null || next == null) return head;

    let last = reverseList(next,next.next);
    head.next.next = head;
    head.next = null;
    return last;
};

reverseList(h)