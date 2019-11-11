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
