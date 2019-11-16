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
var reverseList = function (head) {

  var prev = null //前指针节点
  var cur = head //当前指针节点
  //每次循环，都将当前节点指向它前面的节点，然后当前节点和前节点后移


  while (cur) {
    var next = cur.next
    cur.next = prev
    prev = cur
    cur = next



  }
  return prev

}