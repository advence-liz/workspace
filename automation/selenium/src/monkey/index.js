const { Builder, By, Key, until } = require('selenium-webdriver')
const fs = require('fs-extra')
const path = require('path')
const chrome = require('selenium-webdriver/chrome')
// const loadScript = require('./loadScript')

async function run () {
  let driver = await new Builder().forBrowser('chrome').build()

  try {
    await driver.get('https://www.baidu.com/')

    await driver.findElement(By.id('kw')).sendKeys('webdriver', Key.RETURN)
    await driver.wait(until.titleIs('webdriver_百度搜索'), 1500)

    driver.executeScript(
      fs.readFileSync(path.join(__dirname, 'loadScript.js')).toString()
    )
    driver.executeScript(`
    var horde = window.gremlins.createHorde()
  horde.unleash()`)
    return 'done'
  } finally {
    // await driver.quit()
  }
}
if (!module.parent) {
  run()
} else {
  module.exports = run
}
// <script src="https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js"></script>
