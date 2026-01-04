class RequestPool {
    constructor(max = 5) {
        this.max = max
        this.queue = []
        this.count = 0
    }

    add(func) {
        return new Promise((resolve, reject) => {
            const task = async () => {
                this.count++

                try {
                    const res = await func()
                    resolve(res)
                } catch (error) {
                    reject(error)
                } finally {
                    this.count--
                    this.next()
                }
            }

            this.queue.push(task)
            this.next()
        })

        // if(this.queue.l)
    }

    next() {
        while (this.queue.length && this.count < this.max) {
            const func = this.queue.shift()
            func()
        }
    }
}

const pool = new RequestPool(3)

function mockRequest(id, delay) {
    return () =>
        new Promise((resolve) => {
            setTimeout(() => {
                console.log(`请求${id}完成`)
                resolve(id)
            }, delay)
        })
}

// 添加8个请求进行测试
for (let i = 1; i <= 8; i++) {
    pool.add(mockRequest(i, 1000 * i)).then((res) => {
        console.log(`处理结果: ${res}`)
    })
}
