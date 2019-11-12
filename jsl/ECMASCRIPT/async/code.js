// function fetch(callback) {
//     setTimeout(() => {
//         throw Error('请求失败’)
//         callback()
//     })
// }

try {
  fetch(() => {
    console.log('请求处理') // 永远不会执行
  })
} catch (error) {
  console.log('触发异常', error) // 永远不会执行
}

fs.readFile('/etc/passwd', (err, data) => {
  if (err) throw err
  console.log(data)
})

function async(callback) {
  let result
  try {
    // dosmoething
  } catch (error) {
    callback(error)
  }
  callback(null, result)
}

const fetchPosts = postTitle => (dispatch, getState) => {
  dispatch(requestPosts(postTitle))
  return fetch(`/some/API/${postTitle}.json`)
    .then(response => response.json())
    .then(json => dispatch(receivePosts(postTitle, json)))
}

// 使用方法一
store.dispatch(fetchPosts('reactjs'))
// 使用方法二
store.dispatch(fetchPosts('reactjs')).then(() => console.log(store.getState()))


import { createAction } from 'redux-actions';

class AsyncApp extends Component {
  componentDidMount() {
    const { dispatch, selectedPost } = this.props
    // 发出同步 Action
    dispatch(requestPosts(selectedPost));
    // 发出异步 Action
    dispatch(createAction(
      'FETCH_POSTS',
      fetch(`/some/API/${postTitle}.json`)
        .then(response => response.json())
    ));
  }
// 如果 Action 本身是一个 Promise，它 resolve 以后的值应该是一个 Action 对象，
// 会被dispatch方法送出（action.then(dispatch)），但 reject 以后不会有任何动作；
// 如果 Action 对象的payload属性是一个 Promise 对象，那么无论 resolve 和 reject，
// dispatch方法都会发出 Action。 


import { delay } from 'redux-saga'
import { put, takeEvery, all } from 'redux-saga/effects'

function* incrementAsync() {
  yield delay(1000)
  yield put({ type: 'INCREMENT' })
}
function* watchIncrementAsync() {
  yield takeEvery('INCREMENT_ASYNC', incrementAsync)
}
// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield all([
    watchIncrementAsync()
  ])
}

// yield

function* sample(...args) {
  console.log(args)
  yield 0
  yield 1
  yield 2
  return 3
}

// yield*后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。
let generator = function* () {
  yield 1;
  yield* [2, 3, 4];
  yield * sample();
}


let myIterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
}
[...myIterable] // [1, 2, 3]
// 或者采用下面的简洁写法
let obj = {
  * [Symbol.iterator]() {
    yield 'hello';
    yield 'world';
  }
};

for (let x of obj) {
  console.log(x);
}
// "hello"
// “world"
