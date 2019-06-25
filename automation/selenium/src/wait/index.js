const { Builder, By, Key, until } = require('selenium-webdriver')
const fs = require('fs-extra')
const path = require('path')
const chrome = require('selenium-webdriver/chrome')

async function run () {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build()

  try {
    await driver.get('https://www.baidu.com/')
    await driver.findElement(By.id('kw')).sendKeys('webdriver', Key.RETURN)
    await driver.wait(until.titleIs('webdriver_百度搜索'), 1500)

    const opps = await driver.wait(async () => {
      return new Promise(resolve => {
        setTimeout(resolve, 1000, 'opps')
      })
    }, 2000)
    console.log(opps)

    const oppspfunc = () => {
      return new Promise(resolve => {
        setTimeout(resolve, 1000, 'oppsp')
      })
    }

    const oppsp = await driver.wait(oppspfunc(), 2000)
    console.log(oppsp)
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
