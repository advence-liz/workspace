// fulfilled pendding rejected
function MyPromise(executor) {
    let self = this
    this.value = undefined
    this.reason = undefined
    this.status = 'pending' // 默认promise状态是pending
    this.onfulfilledCallbacks = []
    this.onrejectedCallbacks = []
    function resolve(value) {
        if (self.status === 'pending') {
            //保证状态一旦变更，不能再次修改
            self.value = value
            self.status = 'resolved' // 成功状态
            self.onfulfilledCallbacks.forEach(cb => {
                cb()
            })
        }
    }
    function reject(reason) {
        if (self.status === 'pending') {
            self.status = 'rejected' //失败状态
            self.reason = reason
        }
    }
    try {
        executor(resolve, reject) // 因为会立即执行这个执行器函数
    } catch (error) {
        reject(error)
    }
}

MyPromise.prototype.then = function(onfulfilled, onrejected) {
    let self = this
    return new MyPromise((resolve, reject) => {
        if (this.status === 'resolved') {
            let x = onfulfilled(self.value)
            resolve(x)
        }
        if (this.status === 'rejected') {
            let x = onrejected(self.reason)
            reject(x)
        }
        if (self.status === 'pending') {
            // 订阅
            self.onfulfilledCallbacks.push(() => {
                let x = onfulfilled(self.value)
                resolve(x)
            })
            self.onrejectedCallbacks.push(() => {
                let x = onrejected(self.reason)
                reject(x)
            })
        }
    })
}
let p = new Promise(function(resolve, reject) {
    console.log('start')
    setTimeout(function() {
        resolve('data1')
    }, 1000)
})
p.then(
    v => {
        console.log('success： ' + v)
        return 'data2'
    },
    v => {
        console.log('error： ' + v)
    }
)
p.then(
    v => {
        console.log('success： ' + v)
    },
    v => {
        console.log('error： ' + v)
    }
)
console.log('end')
