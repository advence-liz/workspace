// 实现网络请求失败后的自动重试，如果请求成功，则正常返回，否则按需求重试
// fetchPromiseGenerator: 一个生成网络请求的 Promise 的函数,
//    通过 .then 获取成功结果，通过 .catch 获取错误内容
// count: 重试最大次数，达到最大次数后，返回错误
// interval: 重试时间间隔，每次重试的时间间隔
function retry(fetchPromiseGenerator, count, interval) {
    // code here...
    let time = 0
    // let max = count
    // let interval = interval

    // const sleep = (ms) =>
    //     new Promise((resolve) => {
    //         setTimeout(resolve, ms)
    //     })

    return new Promise((resolve, reject) => {
        const attempt = () => {
            fetchPromiseGenerator()
                .then((res) => {
                    resolve(res)
                })
                .catch(() => {
                    if (time < count) {
                        setTimeout(attempt, interval)
                    } else reject()

                    time++
                })
        }
        attempt()
    })
}

// 测试用例:
let exeCount = 0
const query = () => {
    return new Promise((_res, _rej) => {
        console.log('execute query', exeCount)
        setTimeout(() => {
            ++exeCount > 3 ? _res(exeCount) : _rej('fail')
        }, 1000)
    })
}
retry(query, 3, 1000)
    .then((res) => {
        // handle result
        console.log('res: ', res)
    })
    .catch((error) => {
        console.log('error: ', error)
    })
