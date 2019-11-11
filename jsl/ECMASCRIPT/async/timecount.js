const { execSync } = require('child_process')
function* time() {
  while (true) {
    yield 0
    var startTime = new Date().getTime()
    yield 1
    var endTime = new Date().getTime()
    console.log(time.title, endTime - startTime, 'ms')
  }
}
function TimeCounter(title) {
  var gen = time(title)
  gen.next()
  this.start = title => {
    time.title = title
    gen.next()
  }
  this.end = () => gen.next()
}

var timeCounter = new TimeCounter()
timeCounter.start('test1')

execSync('sleep 1')

timeCounter.end()

timeCounter.start('test2')

execSync('sleep 1')

timeCounter.end()
