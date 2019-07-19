const { Builder, By, Key, until } = require('selenium-webdriver')
const { inspect } = require('util')
const { NORMAL } = require('../config')
const chrome = require('selenium-webdriver/chrome')
/**
 * 运行monkey test 逻辑
 * @prop {string} options.url 要访问的链接
 * @prop {object} options.cookie 需要设置的cookie
 * @prop {bool} options.headless 是否是headless 模式也就是无界面浏览器
 * @prop {times} options.times gremlins 出击次数根据页面的复杂度将其分为三级 simple（1024） normal （4096） complex（8192） 默认normal
 * @description
 * 之前有考虑这个方法要不要暴露一些钩子函数让使用者自定义一些逻辑，现在考量感觉不是很合理Monky 应该没有那么多逻辑，
 * 可能异常情况还是通过提供对应的参数配置来解决吧
 * @todo
 * query 参数目前没有给实现有需要再加吧
 */
async function run(options = {}) {
  const { url, cookie, query, headless = true, times = NORMAL } = options
  const seed = new Date().getTime()
  let chromeOptions = new chrome.Options().setMobileEmulation({
    deviceName: 'iPhone X',
  })

  if (headless) {
    chromeOptions = chromeOptions.headless()
  }
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build()

  try {
    await driver.get(url)
    await driver.manage().addCookie(cookie)
    await driver.navigate().to(url)
    let isDone = false
    let monkeyResult = { count: 0, done: false }

    await driver.executeScript(() => {
      document.getElementById('__vconsole').hidden = true
    })
    driver.executeScript(
      function() {
        window.startMonkeyTest(arguments[0], arguments[1])
      },
      times,
      seed
    )

    while (!isDone) {
      await driver.sleep(1000)
      monkeyResult = await driver.executeScript(() => {
        return window.monkeyResult
      })

      if (monkeyResult.done) {
        isDone = true
        monkeyResult.repeate = `window.startMonkeyTest(${times},${seed})`
      }
    }
    console.dir(monkeyResult)
    return monkeyResult
  } catch {
    console.error(`重现错误打开当前页面控制台输入:window.startMonkeyTest(${times},${seed})`)
  } finally {
    await driver.quit()
  }
}
if (!module.parent) {
  run()
} else {
  module.exports = run
}
