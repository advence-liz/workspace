/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
    let maxProfit = 0
    let min = prices[0]

    for (let i = 0; i < prices.length; i++) {
        if (prices[i] < min) {
            min = prices[i]
            console.log('min', prices[i], i)
        } else if (prices[i] - min > maxProfit) {
            console.log('max', prices[i] - min, i)
            maxProfit = prices[i] - min
        }
    }

    return maxProfit
}

maxProfit([7, 1, 5, 3, 6, 4])
