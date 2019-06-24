const { Builder, By, Key, until } = require('selenium-webdriver')
const fs = require('fs-extra')
const path = require('path')
const chrome = require('selenium-webdriver/chrome')
// const loadScript = require('./loadScript')

async function run () {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new chrome.Options()
        .setMobileEmulation({
          deviceName: 'iPhone X'
        })
        // .headless()
      // .windowSize({ width: 375, height: 640 })
    )
    .build()

  // driver.manage().setTimeouts(100000)

  try {
    await driver.get('http://localhost:8080/')
    let isDone = false
    let monkeyErrors = { count: 0, done: false }
    driver.executeScript(function () {
      window.startMonkeyTest()
    })

    while (!isDone) {
      await driver.sleep(2000)
      monkeyErrors = await driver.executeScript(() => {
        return window.monkeyErrors
      })
      if (monkeyErrors.done) {
        isDone = true
      }
    }

    console.log(monkeyErrors)

    return monkeyErrors
  } finally {
    await driver.quit()
  }
}
if (!module.parent) {
  run()
} else {
  module.exports = run
}
// <script src="https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js"></script>
