/*
 * @lc app=leetcode.cn id=206 lang=javascript
 *
 * [206] 反转链表
 * @ref
 * https://leetcode-cn.com/problems/reverse-linked-list/solution/dong-hua-yan-shi-206-fan-zhuan-lian-biao-by-user74/
 */
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 *  输入: 1->2->3->4->5->NULL
 *  输出: 5->4->3->2->1->NULL
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
// var reverseList = function (head) {
//   if(!head) return null
//   var cur = head
//   var pre = null
//   while(cur){
//     var next = cur.next
//     cur.next = pre
//     pre = cur
//     cur = next 

//   }
//   return pre

// }

// var reverseList = function (head) {


//   function reverse(pre, cur) {
//     if (!cur) return pre
//     var next = cur.next
//     cur.next = pre
    
//     reverse(cur, next)

//   }

//   return reverse(null, head)


// }

let reverseList = (head) =>{
  if(!head ) return null

  function reverse(pre,cur){

    if(!cur) return pre
    var next = cur.next
    cur.next= pre
    pre = cur
    return reverse(cur,next)
  }
  return reverse(null,head)
}

