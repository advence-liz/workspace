
var delay = x => new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, x)
})


var arr = [1, 2, 3, 4]




async function run(arr = [], callback) {

  const LEN = arr.length
  let step = 0
  exec()
  
  function exec() {
    if (step < LEN) {
      var p = delay(arr.slice(0, step))
      step++
      p.then(x => {
        console.log(x,step)  
        exec()
      })
    }
   
  }
}

run(arr)