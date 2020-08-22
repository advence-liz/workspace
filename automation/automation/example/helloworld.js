const { Builder, By, Key, until,Capabilities } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const chromeCapabilities = Capabilities.chrome()
async function run () {
    // 1 初始化chromedriver
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options())
        .withCapabilities(chromeCapabilities.set('timeouts',{ implicit: 1000, pageLoad: 300000, script: 30000 }))
        .build()
    
    try {
        // 2 操作浏览器器打开指定页面
        await driver.get('https://www.baidu.com/')
        // 3 获取页面元素，并进行输入操作
        // await driver.wait(until.elementLocated(By.id('kw')),1500) 如果页面加载比较慢获取DOM元素就会失败，此时就需要添加等待,`until.elementLocated`即等待元素可以被定位
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
