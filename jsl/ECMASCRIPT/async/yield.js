function* sample(...args) {
  console.log(args)
  yield 0
  yield 1
  yield 2
  return 3
}

// var gen = sample()
// gen.next()
// {value: 0, done: false}
// gen.next()
// {value: 1, done: false}
// gen.next()
// {value: 2, done: false}
// gen.next()
// {value: 3, done: true}

function* timer() {
  var start = new Date().getTime()
  yield start
  var end = new Date().getTime() - start
  yield end
}

function* timerPlus() {
  while (true) {
    var start = new Date().getTime()
    yield start
    var end = new Date().getTime() - start
    yield end
  }
}


import { delay } from 'redux-saga'
import { fork, call, put } from 'redux-saga/effects'
import api from './somewhere/api' // app specific
import { receiveData } from './somewhere/actions' // app specific

function* fetchAll() {
  const task1 = yield fork(fetchResource, 'users')
  const task2 = yield fork(fetchResource, 'comments')
  yield call(delay, 1000)
}

function* fetchResource(resource) {
  const {data} = yield call(api.fetch, resource)
  yield put(receiveData(data))
}

function* main() {
  yield call(fetchAll)
}



// import { CANCEL } from 'redux-saga'
import { fork, cancel } from 'redux-saga/effects'

function myApi() {
  const promise = myXhr(...)

  promise[CANCEL] = () => myXhr.abort()
  return promise
}

function* mySaga() {

  const task = yield fork(myApi)

  // ... 过一会儿儿
  // 将会调用 myApi 上的 promise[CANCEL]
  yield cancel(task)
}
// 对于取消 jqXHR 对象，redux-saga 将自动地使用其 abort 方法。
// Generator 函数返回的遍历器对象，都有一个throw方法，
// 可以在函数体外抛出错误，然后在 Generator 函数体内捕获。

var g = function*() {
  try {
    yield
  } catch (e) {
    console.log('内部捕获', e)
  }
}

var i = g()
i.next()

try {
  i.throw('a')
  i.throw('b')
} catch (e) {
  console.log('外部捕获', e)
}
// 内部捕获 a
// 外部捕获 b

// co 模块是著名程序员 TJ Holowaychuk 于 2013 年 6 月发布的一个小工具，
// 用于 Generator 函数的自动执行。

// 下面是一个 Generator 函数，用于依次读取两个文件。

var gen = function*() {
  var f1 = yield readFile('/etc/fstab')
  var f2 = yield readFile('/etc/shells')
  console.log(f1.toString())
  console.log(f2.toString())
}
// co 模块可以让你不用编写 Generator 函数的执行器。

var co = require('co')
co(gen)
// 上面代码中，Generator 函数只要传入co函数，就会自动执行。

// co函数返回一个Promise对象，因此可以用then方法添加回调函数。

co(gen).then(function() {
  console.log('Generator 函数执行完成')
})
// 上面代码中，等到 Generator 函数执行结束，就会输出一行提示。

// Generator 可以看作是数据结构，更确切地说，可以看作是一个数组结构，
// 因为 Generator 函数可以返回一系列的值，这意味着它可以对任意表达式，提供类似数组的接口。

function* doStuff() {
  yield fs.readFile.bind(null, 'hello.txt')
  yield fs.readFile.bind(null, 'world.txt')
  yield fs.readFile.bind(null, 'and-such.txt')
}
// 上面代码就是依次返回三个函数，但是由于使用了 Generator 函数，导致可以像处理数组那样，处理这三个返回的函数。

for (task of doStuff()) {
  // task是一个函数，可以像回调函数那样使用它
}
// 实际上，如果用 ES5 表达，完全可以用数组模拟 Generator 的这种用法。

function doStuff() {
  return [
    fs.readFile.bind(null, 'hello.txt'),
    fs.readFile.bind(null, 'world.txt'),
    fs.readFile.bind(null, 'and-such.txt')
  ]
}
// 上面的函数，可以用一模一样的for...of循环处理！两相一比较，
// 就不难看出 Generator 使得数据或者操作，具备了类似数组的接口。

// 下面是另一个例子，通过 Generator 函数逐行读取文本文件。

function* numbers() {
  let file = new FileReader('numbers.txt')
  try {
    while (!file.eof) {
      yield parseInt(file.readLine(), 10)
    }
  } finally {
    file.close()
  }
}

// 如果有一个多步操作非常耗时，采用回调函数，可能会写成下面这样。

step1(function(value1) {
  step2(value1, function(value2) {
    step3(value2, function(value3) {
      step4(value3, function(value4) {
        // Do something with value4
      })
    })
  })
})
// 采用 Promise 改写上面的代码。

Promise.resolve(step1)
  .then(step2)
  .then(step3)
  .then(step4)
  .then(
    function(value4) {
      // Do something with value4
    },
    function(error) {
      // Handle any error from step1 through step4
    }
  )
  .done()
// 上面代码已经把回调函数，改成了直线执行的形式，但是加入了大量 Promise 的语法。
// Generator 函数可以进一步改善代码运行流程。

function* longRunningTask(value1) {
  try {
    var value2 = yield step1(value1)
    var value3 = yield step2(value2)
    var value4 = yield step3(value3)
    var value5 = yield step4(value4)
    // Do something with value4
  } catch (e) {
    // Handle any error from step1 through step4
  }
}
// co(longRunningTask(value1))

// async await

async function run() {
  var value2 = await step1(value1)
  var value3 = await step2(value2)
  var value4 = await step3(value3)
  var value5 = await step4(value4)
}


// 串行
const users = yield call(fetch, '/users')
const repos = yield call(fetch, '/repos')

// 并行
const [users, repos] = yield [
  call(fetch, '/users'),
  call(fetch, '/repos')
]
const [customers, products] = yield all([
  call(fetchCustomers),
  call(fetchProducts)
])
// race
const {posts, timeout} = yield race({
  posts: call(fetchApi, '/posts'),
  timeout: delay(1000)
})

takeEvery(pattern, saga, ...args)

takeLatest(pattern, saga, ..args)

takeLeading(pattern, saga, ..args)

throttle(ms, pattern, saga, ..args)

debounce(ms, pattern, saga, ..args)

retry(maxTries, delay, fn, ...args)
