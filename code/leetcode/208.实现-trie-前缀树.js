/*
 * @lc app=leetcode.cn id=208 lang=javascript
 *
 * [208] 实现 Trie (前缀树)
 */

// @lc code=start

function TrieNode() {
    this.isEnd = false
    this.children = []
}

var Trie = function() {
    this.root = new TrieNode()
    this.start = 'a'.charCodeAt(0)
    // this.getIndex(c){

    // }
}

/**
 * @param {string} word
 * @return {void}
 */
Trie.prototype.insert = function(word) {
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

/**
 * @param {string} word
 * @return {boolean}
 */
Trie.prototype.search = function(word) {
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

/**
 * @param {string} prefix
 * @return {boolean}
 */
Trie.prototype.startsWith = function(prefix) {
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

/**
 * Your Trie object will be instantiated and called as such:
 * var obj = new Trie()
 * obj.insert(word)
 * var param_2 = obj.search(word)
 * var param_3 = obj.startsWith(prefix)
 */
// @lc code=end
