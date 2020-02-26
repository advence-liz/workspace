// A 3000 4 B 2000 3 C 1500 1
//
// A
// B
// C

var P = [
    { name: 'C', price: 3000, weight: 4 },
    { name: 'B', price: 2000, weight: 3 },
    { name: 'A', price: 1500, weight: 1 }
]
const G = 4
var preResults = [0, 0, 0, 0]
var results = []

function getVal(x, y) {
    if (x < 0 || y < 0) return 0

    return preResults[y]
}

// 外层循环商品
for (var i = 0; i < P.length; i++) {
    // 内层循环包容量
    for (var j = 0; j < G; j++) {
        if (P[i].weight > j + 1) {
            results[j] = 0
        } else {
            // 俩个最优子结构 1 不包含当前商品的最优解  2 当前商品加上减轻当前商品重量的最优解
            results[j] = Math.max(
                getVal(i - 1, j),
                P[i].price + getVal(i - 1, j - P[i].weight)
            )
        }
    }
    console.log(results)
    preResults = [...results]
    //   console.table(results)
}

// Products

// 商品 P 行   容量 G 列

// F(3,4)= Max(F(2,4),F(2,4-w[3])+ p[3])
// ┌─────────┬──────┬──────┬──────┬──────┐
// │ (index) │  0   │  1   │  2   │  3   │
// ├─────────┼──────┼──────┼──────┼──────┤
// │    0    │  0   │  0   │  0   │ 3000 │
// │    1    │  0   │  0   │ 2000 │ 3000 │
// │    2    │ 1500 │ 1500 │ 2000 │ 3500 │
// └─────────┴──────┴──────┴──────┴──────┘
