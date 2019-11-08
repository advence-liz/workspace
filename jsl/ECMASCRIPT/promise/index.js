console.log(module.i)

new Promise((resolve, reject) => {
  setTimeout(() => {
    throw new Error('throw error')
  }, 0)
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




console.log(1)
new Promise(function(resolve, reject) {
  console.log(2)
  resolve()
}).then(function() {
  console.log(4)
}).then(function() {
  console.log(5)
})
console.log(3)




new Promise((resolve, reject) => {
  throw new Error('throw error')
}).catch(err => {
  console.log(err, '捕获到异步错误')
})

new Promise((resolve, reject) => {
  reject('throw error')
}).catch(err => {
  console.log(err, '捕获到异步错误')
})



try {
  console.log(1)
  new Promise(function(resolve, reject) {
    console.log(2)
    throw new Error('?宏')
  }).then(function() {
    console.log(4)
  })
} catch (error) {
  console.log('catch', error)
}


// 宏捕宏
// 微捕微
// 微捕宏