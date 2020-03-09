// A 3000 4 B 2000 3 C 1500 1
//
// A
// B
// C

var products = [
    { name: 'C', price: 3000, weight: 4 },
    { name: 'B', price: 2000, weight: 3 },
    { name: 'A', price: 1500, weight: 1 }
]

// new Array(4).fill(0)
var dp = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]

function getVal(x, y) {
    if (x < 0 || y < 0) return 0
    return dp[x][y]
    // try {
    //   return dp[x][y]
    // } catch (error) {
    //   return 0
    // }
}

function getPrice(product, weight) {
    return product.weight >= weight ? product.price : 0
}

for (var i = 0; i < products.length; i++) {
    for (var j = 0; j < 4; j++) {
        var pre = getVal(i - 1, j)

        var cur = 0
        const { weight, price } = products[i]
        // 如果当前商品重量小于等于包裹容量，当前价值加剩余空间价值
        if (weight <= j + 1) cur = price + getVal(i - 1, j - products[i].weight)

        if (weight > j + 1) cur = 0

        console.log(pre, cur)
        // 比较当前价值加剩余空间价值 和 上次最大价值
        dp[i][j] = Math.max(pre, cur)
    }
}

console.table(dp)

// ┌─────────┬──────┬──────┬──────┬──────┐
// │ (index) │  0   │  1   │  2   │  3   │
// ├─────────┼──────┼──────┼──────┼──────┤
// │    0    │  0   │  0   │  0   │ 3000 │
// │    1    │  0   │  0   │ 2000 │ 3000 │
// │    2    │ 1500 │ 1500 │ 2000 │ 3500 │
// └─────────┴──────┴──────┴──────┴──────┘
