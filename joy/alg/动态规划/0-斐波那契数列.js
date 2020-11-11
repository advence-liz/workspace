function fib(n){
    var dp = new Array(n+1).fill(0)
    dp[1] = dp[2] =1
    for(let i =3;i<=n;i++){
        dp[i] = dp[i - 1] + dp[i - 2]
    }
    console.log(dp[n])
    return dp[n]
}
fib(0)
fib(3)
fib(5)