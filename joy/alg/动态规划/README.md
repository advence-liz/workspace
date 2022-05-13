# 动态规划

https://juejin.cn/post/6844903993429196813#heading-25
https://leetcode-solution-leetcode-pp.gitbook.io/leetcode-solution/thinkings/dynamic-programming#shen-me-shi-hou-yong-ji-yi-hua-di-gui

## 01 背包
https://zhuanlan.zhihu.com/p/93857890
https://www.cnblogs.com/labuladong/p/13927944.html
https://juejin.cn/post/6998802230807625735  解释遍历顺序

```js
int knapsack(int W, int N, vector<int>& wt, vector<int>& val) {
    // base case 已初始化
    vector<vector<int>> dp(N + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= N; i++) {
        for (int w = 1; w <= W; w++) {
            if (w - wt[i-1] < 0) {
                // 这种情况下只能选择不装入背包
                dp[i][w] = dp[i - 1][w];
            } else {
                // 装入或者不装入背包，择优
                dp[i][w] = max(dp[i - 1][w - wt[i-1]] + val[i-1], 
                               dp[i - 1][w]);
            }
        }
    }
    
    return dp[N][W];
}
N = 3, W = 4
wt = [2, 1, 3]
val = [4, 2, 3]
dp[i][j] = max(dp[i−1][j], dp[i−1][j−w[i]]+v[i])

dp[0][..] = dp[..][0] = 0

dp[0,...,W] = 0
for i = 1,...,N
    for j = W,...,w[i] // 必须逆向枚举!!!
        dp[j] = max(dp[j], dp[j−w[i]]+v[i])

```

|  i/j  |   0   |   1   |   2   |   3   |   4   |
| :---: | :---: | :---: | :---: | :---: | :---: |
|   0   |   0   |   0   |   0   |   0   |   0   |
|   1   |   0   |   0   |   4   |   4   |   4   |
|   2   |   0   |   2   |   4   |   6   |   6   |
|   3   |   0   |   2   |   4   |   6   |   6   |


