console.log(module.i)

new Promise((resolve, reject) => {
  setTimeout(() => {
    throw new Error('throw error')
  }, 0)
}).catch(err => {
  console.log(err, '捕获到异步错误')
})

Promise.resolve()
  .then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        throw new Error('throw error')
      }, 0)
    })
  })
  .catch(err => {
    console.log(err, '捕获到异步错误')
  })

// 可捕获异常
new Promise((resolve, reject) => {
  throw new Error('throw error')
}).catch(err => {
  console.log(err, '捕获到异步错误')
})

new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('throw error')
  }, 0)
}).catch(err => {
  console.log(err, '捕获到异步错误')
})

Promise.resolve()
  .then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('throw error')
      }, 0)
    })
  })
  .catch(err => {
    console.log(err, '捕获到异步错误')
  })

console.log(1)
new Promise(function(resolve, reject) {
  console.log(2)
  resolve()
})
  .then(function() {
    console.log(4)
  })
  .then(function() {
    console.log(5)
  })
console.log(3)

// 可以捕获嘛？
try {
  console.log(1)
  new Promise(function(resolve, reject) {
    console.log(2)
    throw new Error('宏')
  }).then(function() {
    console.log(4)
  })
} catch (error) {
  console.log('catch', error)
}

// 宏捕宏
// 微捕微
// 微捕宏
