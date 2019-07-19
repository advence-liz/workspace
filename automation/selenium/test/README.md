# monkey test

## Monky test 使用说明

- 安装浏览器对应版本的[chromedriver](http://chromedriver.storage.googleapis.com/index.html)并添加到环境变量
- 启动 Monky test `npm run monkey` or `jest`
- 启动单独文件的 monkey test`jest <filePath>`
- monkey test 目前都放在`test/monkey`目录下
- 添加自己所负责页面的`monkey test`逻辑，并确保自己的页面可以正常运行`monkey test`反馈那些由于我们未曾预料而无法正常进行`monkey test` case
- 将结果提交到`f_liz_monkey`分支

#### code demo

```js
const run = require('../util/run-monkey')
/**
 * @prop {string} url 要访问的链接
 * @prop {object} cookie 需要设置的cookie
 * @prop {bool} headless 是否是headless 模式也就是无界面浏览器
 * @prop {times} times gremlins 出击次数 根据页面的复杂度将其分为三级 simple normal complex
 */
describe('monkey /v3/union/addInfo', () => {
  const options = {
    url: 'http://127.0.0.1:3000/v3/union/addInfo',
    cookie: { name: 'jwt_auth_token', value: '1' },
    headless: false,
  }
  it('预期错误数0', async () => {
    const monkeyResult = await run(options)

    expect(monkeyResult.count).toEqual(0)
  }, 150000)
})
```

### grace server.json demo

```json
   "api": {
      "laifenqiApi": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiHttp":"http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiSecurity": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiOrder": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiDeal": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiUcenter": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiUtils": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiLoan": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiPassport": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "lfqOrder": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiPromote": "http://${ip}:${port}/__MOCK__/laifenqi.h5/",
      "laifenqiAdmin": "http://${ip}:${port}/__MOCK__/laifenqi.h5/"
    },
```
