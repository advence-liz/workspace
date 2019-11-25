
var delay = x => new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, x)
})


var arr = [1, 2, 3, 4]


async function run(arr = [], i = 0) {

  for (i; i < arr.length; i++) {
    try {
      const r = await delay(arr.slice(0, i))

      console.log(r)
    } catch (error) {
      console.error(error)
    }


  }
}
run(arr)