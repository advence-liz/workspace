function palindrome(s, l, r) {
    // 防止索引越界
    while (l >= 0 && r < s.length && s[l] == s[r]) {
        // 向两边展开
        l--
        r++
    }
    // 返回以 s[l] 和 s[r] 为中心的最长回文串
    return s.substr(l + 1, r - l - 1)
}

let r = palindrome('aba',1,1)
console.log(r)
