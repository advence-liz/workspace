const { ListNode, createLinkList, print } = require('../helper')

const head = createLinkList([1, 2, 3, 4, 5, 6, 7])

/**
 *     1    2 3 4 5
 * pre cur
 * @param {*} head
 * @returns
 */
function reverse(head) {
    if (!head) return

    let prev = null
    let cur = head

    while (cur) {
        let next = cur.next

        cur.next = prev
        prev = cur
        cur = next
    }

    return prev
}

let r = reverse(head)

print(r)
