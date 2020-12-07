const Koa = require('koa')
const fs = require('fs-extra')
const shell = require('shelljs')
const path = require('path')
const marked = require('marked')
const Router = require('koa-router')
const os = require('os')
const tmpDir = os.tmpdir()
const app = new Koa()

// 子路由
let home = new Router()
home.get('/', async ctx => {
    const md = fs.readFileSync(path.join(__dirname, 'README.md'), {
        encoding: 'utf8'
    })
    console.log('test pm2 --wacth')
    ctx.body = marked.parse(md)
})

// 子路由2
let deploy = new Router()
deploy
    .post('/ui', async ctx => {
        console.log(ui)
        const gen = tempTransfer('react')
        const gen1 = tempTransfer('react-demo')
        gen.next()
        gen1.next()
        deployWebsite('ui')
        gen.next()
        gen1.next()
        ctx.body = 'deploy ui succeed'
    })
    .post('/react', async ctx => {
        deployReactWebsite('react')
        ctx.body = 'react'
    })

// 装载所有子路由
let router = new Router()
router.use('/', home.routes(), home.allowedMethods())
router.use('/deploy', deploy.routes(), deploy.allowedMethods())

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())

app.listen(3003, () => {
    console.log('[demo] route-use-middleware is starting at port 3003')
})

function exec(cmd) {
    const { code, stdout, stderr } = shell.exec(cmd)
    if (code !== 0) {
        throw stderr
    }
}
function deployReactWebsite(path = 'react', cb = () => {}) {
    exec(
        `cd ../q-${path} && git reset --hard origin/master && git pull origin master && yarn`
    )
    exec(`cd ../q-${path} && yarn run deploy`)
    exec(`cd ../q-${path} && yarn run deploy:demo`)
    // exec(`yarn run deploy:demo`)
}
function deployWebsite(path = 'ui', cb = () => {}) {
    exec(
        `cd ../q-${path} && git reset --hard origin/master && git pull origin master && yarn && yarn run deploy`
    )
}
/**
 * 因为当 deploy ui 站点的时候会先清空目录，而 react 站点作为ui站点的子目录也被清空了，所以加了这个方法先将 react 转移到临时目录 当ui deploy
 * 结束后再移回来。那为啥子用 generate 呢？感觉这样可以更方便的扩展与 react 并列的子站点
 * @param {string} sourceName 子站点路径
 */
function* tempTransfer(sourceName) {
    const tmpPath = fs.mkdtempSync(`${tmpDir}${path.sep}`, { recursive: true })
    const sourcePath = path.join(__dirname, 'www', sourceName)
    fs.ensureDirSync(sourcePath)
    fs.copySync(sourcePath, tmpPath)

    console.log('copy', sourcePath, tmpPath)
    yield 1
    fs.copySync(tmpPath, sourcePath)
    fs.chmodSync(sourcePath, 0777)
    fs.remove(tmpPath, err => {
        if (err) return console.error(err)
        console.log('remove', tmpPath)
    })
}
