// ts-check
const { By, Key, until, WebElementPromise, Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const path = require('path')
const fs = require('fs-extra')
let DefaultTimeout = 6000
class Automation {
    constructor (options) {
        this.options = options
    }

    timeout (times = 6000) {
        if (times) {
            DefaultTimeout = times
        }

        return this
    }

    async __init () {
        const {
            url,
            cookie,
            headless = false,
            device = false
        } = this.options

        const chromeOptions = new chrome.Options()
        if (headless) {
            chromeOptions.headless()
        }
        if (device) {
            chromeOptions.setMobileEmulation({
                deviceName: device
            })
        }

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build()
        await this.driver.get(url)
        if (cookie) {
            await this.driver.manage().addCookie(cookie)
            await this.driver.navigate().to(url)
        }
    }
    /**
   *@type {import('selenium-webdriver').until}
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
   *@return {import(@'selenium-webdriver').until}
   */
    get until () {
        return until
    }

    /**
   * @typedef {import('selenium-webdriver').Key} Key
   */
    get Key () {
        return Key
    }

    async executeScript (script) {
        await this.driver.executeScript(script)
    }

    async isLocated (selector) {
        await this.driver.wait(until.elementLocated(By.css(selector)))
    }

    wait (condition, times = DefaultTimeout) {
        try {
            return this.driver.wait(condition, times)
        } catch (error) {
            return false
        }
    }

    async sleep (times) {
        await this.driver.sleep(times)
    }

    async refresh () {
        await this.driver.navigate().refresh()
    }

    findElementByXpath (selector) {
        return new WebElementPromise(
            this.driver,
            this.wait(this.until.elementLocated(By.xpath(selector))).then(() => {
                return this.driver.findElement(By.xpath(selector))
            })
        )
    }

    findElements (selector, times = DefaultTimeout) {
        return new WebElementPromise(
            this.driver,
            this.wait(this.until.elementLocated(By.css(selector)), times).then(() => {
                return this.driver.findElements(By.css(selector))
            })
        )
    }

    findElement (selector, times = DefaultTimeout) {
        return new WebElementPromise(
            this.driver,
            this.wait(this.until.elementLocated(By.css(selector)), times).then(() => {
                return this.driver.findElement(By.css(selector))
            })
        )
    }

    async back () {
        await this.driver.navigate().back()
    }
    async start (method) {
        await this.__init()
        try {
            await this[method]()
            return this
        } catch (error) {
            console.error(error)
        } finally {
            this.close()
        }
    }
    async close () {
        this.sleep(2000)
        this.driver.quit()
    }
    async quit () {
        await this.driver.quit()
    }
    async takeScreenshot (name = '') {
        const data = await this.driver.takeScreenshot()
        const screenshotDir = path.join(__dirname, '..', 'tmp', 'screenshot')
        fs.ensureDirSync(screenshotDir)
        fs.writeFileSync(
            path.join(screenshotDir, `${name}${new Date().getTime()}.png`),
            data,
            'base64'
        )
    }

    async selectSinglePicker (offset) {
        const picker = await this.findElement('.q-picker-indicator')
        await this.sleep(500)
        await this.selectPicker(picker, offset)
        await this.findElement('.pickerView_header_confirm').click()
        await this.sleep(500)
    }

    async selectPicker (picker, offset) {
        const rect = await picker.getRect()
        const clientHeight = rect.height
        // x y 不能为小数 x + 1 防止 x 为小数转为 int 类型是小于实际偏移量
        const offsetX = parseInt(rect.x + 1, 10)
        const offsetY = parseInt(rect.y, 10)
        const scrollTop = await this.driver.executeScript(function () {
            return document.documentElement.scrollTop
        })
        const actions = this.driver.actions()
        await actions
            .move({ x: offsetX, y: offsetY - scrollTop })
            .press()
            .move({ x: offsetX, y: offsetY - scrollTop - clientHeight * offset - 2 })
            .release()
            .perform()
        await this.sleep(500)
    }
}

module.exports = Automation
