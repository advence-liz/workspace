const { ListNode, createLinkList, print } = require('./helper')

var head = createLinkList([1, 2, 3, 4, 5])



// pre in post
function pre(head){
    if(!head) return
    console.log(head.val)
    pre(head.next)


}
pre(head)

function post(head){

    if(!head) return
    post(head.next)
    console.log(head.val)
}
post(head)