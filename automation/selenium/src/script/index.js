const { Builder, By, Key, until } = require('selenium-webdriver')
const fs = require('fs-extra')
const path = require('path')
const chrome = require('selenium-webdriver/chrome')

function loadScript () {
  var head = document.getElementsByTagName('head')[0]
  var found = false

  var script = document.createElement('script')

  script.src = 'https://cdn.bootcss.com/gremlins.js/0.1.0/gremlins.min.js'
  head.appendChild(script)
}
// function unleashGremlins (ttl, callback) {
//   function stop () {
//     horde.stop()
//     callback()
//   }
//   var horde = window.gremlins.createHorde()
//   horde.seed(1234)
//   horde.after(callback)
//   window.onbeforeunload = stop
//   setTimeout(stop, ttl)
//   horde.unleash()
// }

// const gremlinsScript = `(function(){
//   window.gremlins = 'iz'
// })()`
async function run () {
  let driver = await new Builder().forBrowser('chrome').build()

  try {
    await driver.get('http://localhost:8080/')
    // await driver.findElement(By.id('kw')).sendKeys('webdriver', Key.RETURN)
    // await driver.wait(until.titleIs('webdriver_百度搜索'), 1500)
    // driver
    //   .executeAsyncScript(loadScript)
    //   .then(function () {
    //     console.log(111)
    //   })
    //   .catch(function (err) {
    //     console.error(err)
    //   })

    driver.executeScript(`window.addGremlins()`)
    return 'done'
  } finally {
    // await driver.quit()
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
