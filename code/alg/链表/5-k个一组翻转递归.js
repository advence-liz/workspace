const { ListNode, createLinkList, print } = require('./helper')

// 给定 1->2->3->4, 你应该返回 2->1->4->3.

/**
 * @param {ListNode} head
 * @return {ListNode}
 * 1->2->3->4
 *  0<-0->0->0->0->0
 *  pre
 */
var reverseKGroup = function(head, k) {
    // 检查是否有足够的节点进行反转
    let check = head;
    for (let i = 0; i < k; i++) {
        if (!check) return head; // 不足k个，直接返回
        check = check.next;
    }
    
    // 反转当前k个节点
    let prev = null;
    let curr = head;
    for (let i = 0; i < k; i++) {
        let next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    // 递归处理后续节点并连接
    head.next = reverseKGroup(curr, k);
    return prev;
};

let head = createLinkList([1, 2, 3, 4, 5, 6, 7])
let r = reverseKGroup(head, 3)
print(r)
