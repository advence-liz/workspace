const $btn = document.querySelector('#test')
const $result = document.querySelector('#result')

function channel() {
  let taker

  function take(cb) {
    console.log('take')
    taker = cb
  }

  function put(input) {
    if (taker) {
      const tempTaker = taker
      console.log('escape take')
      taker = null
      tempTaker(input)
    }
  }

  return {
    put,
    take
  }
}

const chan = channel()

let i = 0
$btn.addEventListener(
  'click',
  () => {
    chan.put(`action data${i++}`)
  },
  false
)

function take() {
  return {
    type: 'take'
  }
}

function fork(cb) {
  return {
    type: 'fork',
    fn: cb
  }
}

function* takeEvery(worker) {
  yield fork(function*() {
    while (true) {
      console.log('takeEvery1')
      const action = yield take()
      console.log('takeEvery2')
      worker(action)
    }
  })
}

function* mainSaga() {
  // const action = yield take()
  // console.log(action)

  // const action1 = yield take()
  // console.log(action1)
  yield takeEvery(action => {
    $result.innerHTML = action
  })
  yield takeEvery(action => {
    console.log(1)
  })
}

function runTakeEffect(effect, cb) {
  chan.take(input => {
    cb(input) // 阻塞当调用put时执行
  })
}

function runForkEffect(effect, cb) {
  task(effect.fn || effect) // 执行当前 gen take 是停止然后执行下面的cb 也就是next
  cb()
}

function task(iterator) {
  const iter = typeof iterator === 'function' ? iterator() : iterator
  function next(args) {
    const result = iter.next(args)
    if (!result.done) {
      const data = result.value

      if (typeof data[Symbol.iterator] === 'function') {
        runForkEffect(data, next)
      } else if (data.type) {
        switch (data.type) {
          case 'take':
            runTakeEffect(result.value, next)
            break
          case 'fork':
            runForkEffect(result.value, next)
            break
          default:
        }
      }
    }
  }
  next()
}

task(mainSaga)
