const { Builder, By, Key, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

async function run () {
    // 1 初始化chromedriver
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options())
        .build()
    console.log(await driver.getCapabilities())
    try {
        // 2 操作浏览器器打开指定页面
        await driver.get('https://www.baidu.com/')
        // 3 获取页面元素，并进行输入操作
        await driver.findElement(By.id('kw')).sendKeys('helloworld', Key.RETURN)
        // 4 等待页面title转变为指定值
        await driver.wait(until.titleIs('helloworld_百度搜索'), 1500)
        return 'done'
    } finally {
        // 5 退出浏览器
        await driver.quit()
    }
}
run()
