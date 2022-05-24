/*
 * @lc app=leetcode.cn id=139 lang=javascript
 *
 * [139] 单词拆分
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 *
 */
//  class Solution:
//  def wordBreak(self, s: str, wordDict: List[str]) -> bool:
//      @functools.cache
//      def dfs(s: str, start: int):
//          if start == len(s):
//              return True
//          for i in range(start, len(s)):
//              if s[start: i + 1] in wordDict and dfs(s, i + 1):
//                  return True
//          return False

//      return dfs(s, 0)

// https://leetcode.cn/problems/word-break/solution/shou-hui-tu-jie-san-chong-fang-fa-dfs-bfs-dong-tai/
var wordBreak = function(s, wordDict) {
    let ws = new Set(wordDict)
    let memo = new Array(s.length)
    function dfs(start) {
        if (start === s.length) {
            return true
        }
        if (memo[start] !== undefined) return memo[start]

        let res = false
        for (let i = start; i < s.length; i++) {
            let word = s.slice(start, i + 1)
            // 剪枝
            if (!ws.has(word)) continue

            res = dfs(i + 1)
            // 搜索到正确答案返回了
            if (res) {
                memo[start] = true
                return true
            }

            // if (ws.has(word)) {
            //     return dfs(i + 1)
            // }
        }
        memo[start] = false
        return false
    }
    return dfs(0)
}
// @lc code=end
