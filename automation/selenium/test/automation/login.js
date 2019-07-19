const Automation = require('../util/automation')

class Login extends Automation {
  async run() {
    // 输入手机号
    await this.findElement('.login-form > div.login-form__input.login-form__input--tel > div > div.q-list-line__bd > input').sendKeys('18504411849')
    await this.sleep(1000)
    // 发送验证码
    await this.findElement('.login-form > div.login-form__input.login-form__input--code > p').click()
    await this.sleep(1000)
    // 输入验证码
    await this.findElement('.login-form > div.login-form__input.login-form__input--code > div > div.q-list-line__bd > input').sendKeys('123456')
    await this.sleep(1000)
    // click
    await this.findElement('.login > div.login__button.log-target > div').click()
    // await this.sleep(1000)

    // await this.findElement('#app > div > div > div.footer > div > div').click()
    await this.driver.wait(this.until.urlContains('done'))

    return 'done'
  }
}

const options = {
  url: 'http://127.0.0.1:3000/v3/union/login',
  cookie: { name: 'jwt_auth_token', value: '1' },
  headless: false,
}

if (!module.parent) {
  new Login(options).start()
} else {
  module.exports = new Login(options)
}
