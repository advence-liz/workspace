let nums = 12345.6

function parseToMoney(nums) {
    let [x, y] = nums.toString().split('.')
    let re = '.' + y
    while (x) {
        let cur = x % 1000
        x = Math.floor(x / 1000)
        re = `${x ? ',' : ''}${cur}${re}`
    // re =(x? ',':''+cur+re)
    }
    return re
}

let r = parseToMoney(12345.6)
console.log(r)
