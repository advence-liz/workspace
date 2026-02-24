async function requestPool(tasks, limit) {
    let res = []
    let currentIndex = 0

    async function worker() {
        while (currentIndex < tasks.length) {
            let index = currentIndex
            currentIndex++
            try {
                res[index] = await tasks[index]()
            } catch (error) {
                res[index] = error
            }
        }
    }

    let workers = []
    for (let i = 0; i < Math.min(tasks.length, limit); i++) {
        workers.push(worker())
    }
    await Promise.all(workers)
    return res
}

// 测试代码
const createTask = (value, delay) => {
    return () =>
        new Promise((resolve) => {
            console.log(`任务 ${value} 开始`)
            setTimeout(() => {
                console.log(`任务 ${value} 完成`)
                resolve(value)
            }, delay)
        })
}

const tasks = [
    createTask(1, 3000),
    createTask(2, 1000),
    createTask(3, 2000),
    createTask(4, 1500),
    createTask(5, 500)
]

requestPool(tasks, 2).then((results) => {
    console.log('所有任务完成，结果:', results)
})
