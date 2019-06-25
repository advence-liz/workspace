# selenium-webdriver

## selenium-webdriver 

- webdriver 协议现在已经成为业内公认的浏览器ui测试的标准实现。简而言之，做浏览器ui测试，请认准selenium webdriver商标。
- 与其他E2E工具相比 webdriver 技术栈有着最强的跨平台能力可以测试各种浏览器
## 测试的一些概念

- E2E测试
- UI测试
- 接口测试
- 单元测试
- BDD
- TDD

## E2E

- 端到端测试一般都需要一个Web容器，来运行前端应用。例如Chromium, Electron, PhantomJS, WebDriver等等。
- 从速度的角度考虑：PhantomJS, WebDriver < Electon, Chromium ,webDriver headless
- webdriver 协议现在已经成为业内公认的浏览器ui测试的标准实现。简而言之，做浏览器ui测试，请认准selenium webdriver商标。webdriver协议是google对开源测试领域的重要贡献，感谢google赏饭吃。

- 各种官方支持意味着以后的浏览器ui测试的速度和稳定性会有较大的提升。selenium 2.0时代只有chrome driver是官方出品(我是不是忘了opera driver？？)，其它实现均是第三方。从稳定性上说，2.0时代最稳定的测试浏览器是chrome和firefox，其它浏览器支持均或多或少有些问题，不过这些问题应该是一去不复返了吧。什么时候appnium会有官方的支持呢？

- 浏览器ui自动化测试已经成为了行业标配。这也是为什么几乎所有浏览器厂商都推出自己官方driver的原因。

- selenium专注web测试。这个问题几年前selenium团队就应该做了解答，app的测试就交给更专业的app测试工具去做吧。

```
项目	Web	Star
puppeteer	Chromium (~170Mb Mac, ~282Mb Linux, ~280Mb Win)	31906
nightmare	Electron	15502
nightwatch	WebDriver	8135
protractor	selenium	7532
casperjs	PhantomJS	7180
cypress	Electron	5303
Zombie	不需要	4880
testcafe	不需要	4645
CodeceptJS	webdriverio	1665
```

## TODO
- selenium 3.0
- webdriver.io 
## REF

- https://www.cnblogs.com/fnng/p/3653793.html
- https://wdd.js.org/e2e-testing-hacker-news-with-cypress.html
- https://www.cnblogs.com/nbkhic/p/5779453.html

