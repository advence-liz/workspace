import { preFetchLib } from 'hel-micro'

async function main() {
    await preFetchLib('hel-lodash')
    await import('./init.js') // 入口文件后移
}
main().catch(console.error)
