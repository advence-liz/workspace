/*
 * @lc app=leetcode.cn id=208 lang=javascript
 *
 * [208] 实现 Trie (前缀树)
 */

// @lc code=start

class TrieNode {
    constructor() {
        this.isEnd = false
        this.children = []
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode()
        this.start = 'a'.charCodeAt(0)
    }
    insert(word) {
        let node = this.root
        for (let i = 0; i < word.length; i++) {
            let index = word.charCodeAt(i) - this.start
            if (!node.children[index]) {
                node.children[index] = new TrieNode()
            }
            node = node.children[index]
        }
        node.isEnd = true
    }

    search(word) {
        let node = this.root

        for (let i = 0; i < word.length; i++) {
            let index = word.charCodeAt(i) - this.start
            if (!node.children[index]) {
                return false
            }
            node = node.children[index]
        }
        return node.isEnd === true
    }
    startsWith(prefix) {
        let node = this.root

        for (let i = 0; i < prefix.length; i++) {
            let index = prefix.charCodeAt(i) - this.start
            if (!node.children[index]) {
                return false
            }
            node = node.children[index]
        }
        return true
    }
}

var obj = new Trie()

obj.insert('liz')
var r = obj.search('li')
var r1 = obj.startsWith('li')

console.log('r', r)
console.log('r1', r1)

/**
 * Your Trie object will be instantiated and called as such:
 * var obj = new Trie()
 * obj.insert(word)
 * var param_2 = obj.search(word)
 * var param_3 = obj.startsWith(prefix)
 */
// @lc code=end
