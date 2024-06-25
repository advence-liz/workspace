/*
 * @lc app=leetcode.cn id=140 lang=javascript
 *
 * [140] 单词拆分 II
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {string[]}
 * https://leetcode.cn/problems/word-break-ii/solution/dan-ci-chai-fen-ii-by-leetcode-solution/
 */
var wordBreak = function(s, wordDict) {
    // let ws = new Set(wordDict)
    // let res = []
    // function dfs(start, paths) {
    //     if (start === s.length) {
    //         // 指针越界，剩余子串是空串，划分不出东西，返回[[]]
    //         return res.push([...paths])
    //     }
    //     // let res = []
    //     for (let i = start; i < s.length; i++) {
    //         let word = s.slice(start, i + 1)

    //         if (ws.has(word)) {
    //             paths.push(word)
    //             dfs(i + 1, paths) // restRes是剩余子串返回出的结果数组
    //             // return res.push(word).push(...sub)
    //             paths.pop()
    //         }
    //     }
    //     // return res
    // }
    // var r = dfs(0, [])
    // return res

    let ws = new Set(wordDict)
    let memo = new Map()

    function dfs(start) {
        if (memo.has(start)) {
            return memo.get(start)
        }
        let res = []
        if (start === s.length) {
            res.push([])
            // return res
        }

        for (let i = start; i < s.length; i++) {
            let word = s.slice(start, i + 1)
            // 剪枝
            if (!ws.has(word)) continue

            if (ws.has(word)) {
                let subRes = dfs(i + 1)

                for (let sub of subRes) {
                    res.push([word, ...sub])
                }
            }
        }
        memo.set(start, res)
        return res
    }

    return dfs(0).map(words => {
        // 子数组转成" "连接的字符串
        return words.join(' ')
    })
}
// var r = wordBreak('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog'])
// console.log(r)
// @lc code=end
