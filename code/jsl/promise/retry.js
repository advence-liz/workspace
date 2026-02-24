function retry(fn, times) {
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch((err) => {
                if (times > 0) {
                    retry(fn, times - 1).then(resolve, reject)
                } else {
                    reject(err)
                }
            })
    })
}

const simulateRequest = (shouldSucceedAfter, successResult) => {
    let callCount = 0
    return () => {
        callCount++
        console.log(`第 ${callCount} 次尝试调用...`)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (callCount >= shouldSucceedAfter) {
                    resolve(successResult)
                } else {
                    reject(new Error(`第 ${callCount} 次失败`))
                }
            }, 100) // 模拟 100ms 网络延迟
        })
    }
}

// --- 开始测试 ---

async function runTests() {
    console.log('--- 测试 1: 失败2次，第3次成功 (总共允许3次) ---')
    try {
        // 创建一个必须调用3次才会成功的函数
        const requestFn = simulateRequest(3, '最终成功的数据')
        const res = await retry(requestFn, 3)
        console.log('✅ 测试通过，结果:', res)
    } catch (e) {
        console.error('❌ 测试失败:', e)
    }

    console.log(
        '\n--- 测试 2: 失败次数超过允许次数 (需要4次成功，但只允许3次) ---'
    )
    try {
        // 创建一个必须调用4次才会成功的函数，但我们只 retry 3次
        const requestFn = simulateRequest(4, '永远无法到达的数据')
        await retry(requestFn, 3)
        console.error('❌ 测试失败: 应该报错但没有报错')
    } catch (e) {
        console.log('✅ 测试通过，捕获到预期错误:', e.message)
    }
}

// 运行
runTests()
