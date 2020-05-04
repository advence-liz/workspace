// https://www.jianshu.com/p/4410c0f97ce3
function runSerial(lists, asyncTask) {
    let promise = Promise.resolve()
    _.each(lists, (i) => {
        promise = promise.then(() => asyncTask(i))
    })
    return promise
}