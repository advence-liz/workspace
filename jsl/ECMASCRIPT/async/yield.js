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



import { CANCEL } from 'redux-saga'
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
对于取消 jqXHR 对象，redux-saga 将自动地使用其 abort 方法。