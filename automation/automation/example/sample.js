const Automation = require('../util/automation')

class Sample extends Automation {
    async run () {
        await this.findElement('#kw').sendKeys('webdriver', this.Key.RETURN)
        await this.wait(this.until.titleIs('webdriver_百度搜索'))
        await this.takeScreenshot('baidu')
    }
}

new Sample({ url: 'https://www.baidu.com/', headless: true }).start('run')
