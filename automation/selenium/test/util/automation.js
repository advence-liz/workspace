const { Builder, By, Key, until } = require('selenium-webdriver')
const { LegacyTouchSequence } = require('selenium-webdriver/lib/actions')
const chrome = require('selenium-webdriver/chrome')

class Automation {
  constructor(options) {
    this.options = options
  }

  /**
   *
   *@prop ableToSwitchToFrame(frame): 直到selenium可以将定位上下文切换到frame里
   *@prop alertIsPresent(): 直到alert出现
   *@prop elementIsDisabled(element): 直到元素灰掉，不能被点击
   *@prop elementIsEnabled(element): 直到元素可以被点击
   *@prop elementIsNotSelected(element): 直到元素不可选
   *@prop elementIsNotVisible(element): 直到元素不可见
   *@prop elementIsSelected(element): 直到元素可选
   *@prop elementIsVisible(element): 直到元素可见
   *@prop elementLocated(locator): 最常用，直到元素可以被定位
   *@prop elementTextContains(element, substr): 直到元素的text包含substr
   *@prop elementTextIs(element, expected_text): 直到元素的text是expected_text
   *@prop elementTextMatches(element,regex): 直到元素的text满足正则表达式regex
   *@prop elementsLocated(locator): 直到一组元素被定位
   *@prop stalenessOf(element): 直到元素被dom树移除或页面刷新
   *@prop titleContains(substr): 直到页面title包含substr
   *@prop titleIs(expected_title): 直到页面的title是expected_title
   *@prop titleMatches(regex): 直到页面的title满足正则表达式regex
   *@prop urlContains(substrUrl): 直到页面url包含substrUrl
   *@prop urlIs(expected_url): 直到页面的url是expected_url
   *@prop urlMatches(regex): 直到页面的url满足正则表达式regex
   */
  get until() {
    return until
  }

  /**
   * @typedef {import('selenium-webdriver').Key} Key
   */
  get Key() {
    return Key
  }

  async init() {
    const {
      url,
      cookie = { name: 'jwt_auth_token', value: '1' },
      headless = true,
    } = this.options
    const chromeOptions = new chrome.Options().setMobileEmulation({
      deviceName: 'iPhone X',
    })
    if (headless) {
      chromeOptions = chromeOptions.headless()
    }
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build()
    await this.driver.get(url)
    await this.driver.manage().addCookie(cookie)
    await this.driver.navigate().to(url)
  }

  async isLocated(selector) {
    await this.driver.wait(until.elementLocated(By.css(selector)))
  }

  async wait(condition, times) {
    await this.driver.wait(condition, times)
  }

  async sleep(times) {
    await this.driver.sleep(times)
  }

  findElement(selector) {
    return this.driver.findElement(By.css(selector))
  }

  findElements(selector) {
    return this.driver.findElements(By.css(selector))
  }

  async start() {
    await this.init()
    try {
      const done = await this.run()
      return done
    } catch (error) {
      console.error(error)
    } finally {
      await this.driver.quit()
    }
  }

  async selectPicker(picker, offset) {
    const rect = await picker.getRect()
    console.log(rect)
    const clientHeight = rect.height
    // x y 不能为小数 x + 1 防止 x 为小数转为 int 类型是小于实际偏移量
    const offsetX = parseInt(rect.x + 1, 10)
    const offsetY = parseInt(rect.y, 10)
    await new LegacyTouchSequence(this.driver)
      .tapAndHold({ x: offsetX, y: offsetY })
      .move({ x: offsetX, y: offsetY - clientHeight * offset - 2 })
      .release({ x: offsetX, y: offsetY - clientHeight * offset - 2 })
      .perform()
  }
}

module.exports = Automation
