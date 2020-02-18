/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 * @description
 * 输入: 1->2->3->4->5->NULL
 * 输出: 5->4->3->2->1->NULL
 */
var reverseList = function(head) {
  var prev = null  
  var cur = head
      
  // 1. 保留 next 节点
  // 2. cur 指向 prev
  // 3. prev cur 向后移动
  while(cur){
    var next = cur.next
    cur.next = prev
    
    prev = cur
    cur = next
    
  }
  return prev
}

// var reverseList = function(head) {
    
//     var cur = head
// 临界条件本身就有问题
//     while(cur.next&&cur.next.next){
//       var next = cur.next
//       cur.next = next.next
//       next.next = cur
//       cur = cur.next
  
//     }
    
//     return cur
//   }