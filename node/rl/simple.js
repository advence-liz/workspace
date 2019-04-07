const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question (text) {
  return new Promise(function (resolve, reject) {
    rl.question(text, answer => {
      resolve([answer, rl])
    })
  })
}
async function ask (q) {
  const [answer, rl] = await question(q)
  rl.close()
  return answer
}

async function main () {
  await ask('are you ok ?')
  console.log('after ok')
}
main()
