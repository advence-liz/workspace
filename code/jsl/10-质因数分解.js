function decPrime(n) {
    let res = []
    for (let i = 2; i <= n; i++) {
        if (n % i === 0) {
            res.push(i)
            n = Math.floor(n / i)
            i = 1
        }
    }
    console.log(res)
    return res
}
decPrime(8)

decPrime(123123)
