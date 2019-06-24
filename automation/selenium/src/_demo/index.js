const { Builder, By, Key, until } = require('selenium-webdriver')
const fs = require('fs-extra')
const path = require('path')
const chrome = require('selenium-webdriver/chrome')

async function run () {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless())
    .build()

  try {
    await driver.get('https://www.baidu.com/')
    await driver.findElement(By.id('kw')).sendKeys('webdriver', Key.RETURN)
    await driver.wait(until.titleIs('webdriver_百度搜索'), 1500)

    const data = await driver.takeScreenshot()
    fs.ensureDir(path.join(__dirname, '__screenshot__'))
    fs.writeFileSync(
      path.join(__dirname, '__screenshot__', `${new Date().getTime()}.png`),
      data,
      'base64'
    )

    return 'done'
  } finally {
    await driver.quit()
  }
}
if (!module.parent) {
  run()
} else {
  module.exports = run
}

// var webdriver = require('selenium-webdriver'),
//     By = webdriver.By,
//     until = webdriver.until;

// var driver = new webdriver.Builder()
//     .forBrowser('chrome')
//     .build();

// driver.get('https://www.baidu.com');
// driver.findElement(By.id('kw')).sendKeys('webdriver');
// driver.findElement(By.id('su')).click();
// driver.wait(until.titleIs('webdriver_百度搜索'), 1000);
// driver.quit();
