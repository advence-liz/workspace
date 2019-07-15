const { Builder, By, Key, until } = require('selenium-webdriver')
const { LegacyTouchSequence } = require('selenium-webdriver/lib/actions')
const fs = require('fs-extra')
const path = require('path')
const chrome = require('selenium-webdriver/chrome')

class Page {
  async init () {
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new chrome.Options().setMobileEmulation({
          deviceName: 'iPhone X'
        })
      )
      .build()
  }
  async run () {
    await this.init()
    try {
      await this.driver.get('http://localhost:8080/')
      await this.driver.findElement(By.css('#click-case')).click()
      await this.driver.findElement(By.css('#input-case')).sendKeys('name')

      const pickers = await this.driver.findElements(
        By.css('.rmc-picker-indicator')
      )
      await this.selectPicker(pickers[0], 2)
      await this.driver.sleep(300) // 没有延长不行
      await this.selectPicker(pickers[1], 3)
      await this.driver.wait(until.titleContains('done'))
      return 'done'
    } finally {
      await this.driver.quit()
    }
  }

  async selectPicker (picker, offset) {
    const rect = await picker.getRect()
    console.log(rect)
    let clientHeight = rect.height
    // x y 不能为小数 x + 1 防止 x 为小数转为 int 类型是小于实际偏移量
    let offsetX = parseInt(rect.x + 1, 10)
    let offsetY = parseInt(rect.y, 10)
    await new LegacyTouchSequence(this.driver)
      .tapAndHold({ x: offsetX, y: offsetY })
      .move({ x: offsetX, y: offsetY - clientHeight * offset - 2 })
      .release({ x: offsetX, y: offsetY - clientHeight * offset - 2 })
      .perform()
  }
}

if (!module.parent) {
  new Page().run()
} else {
  module.exports = new Page()
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
