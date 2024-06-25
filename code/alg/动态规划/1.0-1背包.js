/**
 *
 * N = 3, W = 4
wt = [2, 1, 3]
val = [4, 2, 3]
dp[i][j] = max(dp[i−1][j], dp[i−1][j−w[i]]+v[i])

 */
function WeightBagProblem(wt = [2, 1, 3], val = [4, 2, 3], N = 3, W = 4) {
    // var dp = new Array(N + 1).fill(new Array(W + 1).fill(0)) 通过 fill 生成二维数组引用相同，d[i][j]赋值时会改变其他值
    // 直接 new Array(N + 1) 不加 .fill(0) 虽然数组长度是 N+1 但是数据为
    var dp = new Array(N + 1).fill(0).map(() => new Array(W + 1).fill(0))

    // for (let i = 0; i < dp.length; i++) {
    //     dp[i] = new Array(W + 1).fill(0)
    // }

    // console.log(dp)
    // return
    // 状态 1 商品
    for (let i = 1; i <= N; i++) {
        // 状态 2  背包容量
        for (let j = 1; j <= W; j++) {
            // 装入背包
            if (j >= wt[i - 1]) {
                dp[i][j] = Math.max(
                    dp[i - 1][j],
                    dp[i - 1][j - wt[i - 1]] + val[i - 1]
                )
            }
            // 不装入背包
            else {
                dp[i][j] = dp[i - 1][j]
            }
        }
        // console.log(dp)
    }
    console.log(dp)
}

function WeightBagProblem2(wt = [2, 1, 3], val = [4, 2, 3], N = 3, W = 4) {
    // var dp = new Array(N + 1).fill(new Array(W + 1).fill(0)) 通过 fill 生成二维数组引用相同，d[i][j]赋值时会改变其他值
    // 直接 new Array(N + 1) 不加 .fill(0) 虽然数组长度是 N+1 但是数据为
    var dp = new Array(W + 1).fill(0)

    dp[0] = 0
    // return
    // 状态 1 商品
    for (let i = 1; i <= N; i++) {
        // 状态 2  背包容量
        for (let j = W; j >= wt[i - 1]; j--) {
            dp[j] = Math.max(dp[j], dp[j - wt[i - 1]] + val[i - 1])
        }
        console.log(dp)
    }
    // console.log(dp)
}
var r = WeightBagProblem()

var r2 = WeightBagProblem2()
/**
 * dp[i][j] = Math.max(dp[i-1][j],dp[i-1][j-w[i]]+v[i])
 *
 * dp[i][j] = Math.max(dp[i-1][j],dp[i][j-w[i]]+v[i])
 * 滚动数组优化，将二维数组优化到一维
 * dp[j] = Math.max(dp[j],dp[j-w[i]]+v[i])
 * 01 背包
 * dp[i][j] = Math.max(dp[i-1][j],dp[i-1][j-w[i]]+v[i])
 * 循环 j 时 依赖上一层的 j ，和上一层的 j-w[i]
 * dp[0...j] 为上一层循环的值，倒序可以保证 dp[j] 可以获取上一层的 j 和 上一层 的 j-w[i]
 * 完全背包
 * dp[i][j] = Math.max(dp[i-1][j],dp[i][j-w[i]]+v[i])
 * 循环 j 时 依赖上一层循环的 j ，和当前层循环的 j-w[i]
 * dp[0...j] 为上一层循环的值,正序可以保证 dp[j] 获取上一层循环的 j ，和当前层循环的 j-w[i]
 * for i = 1,....,N
 *   for j= W,....w[i] W[i] 为 物品i可以装进背包的临界条件
 *
 */
// 商品/容量
// [
//   [ 0, 0, 0, 0, 0 ],
//   [ 0, 0, 4, 4, 4 ],
//   [ 0, 2, 4, 6, 6 ],
//   [ 0, 2, 4, 6, 6 ]
// ]
