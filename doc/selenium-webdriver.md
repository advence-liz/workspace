---
presentation:
  width: 960
  height: 800
---

# 自动化测试

> 搬运一些文档为不了解自动化测试的同学铺铺路

所谓自动化测试按照我理解就是用脚步来执行不用手动操作的就是自动化测试，
自动化测试大概分为三种：UI测试（E2E测试)，单元测试，接口测试

![](https://images0.cnblogs.com/i/311516/201404/091113466221239.jpg)

## E2E测试框架一览

我们这次主要关注UI测试接下来将介绍一些世面上的E2E框架和和我们的技术选型 selenium-webdriver

|项目 |Web| Star
| puppeteer  | Chromium (~170Mb Mac, ~282Mb Linux, ~280Mb Win) | 31906 |
| ---------- | ----------------------------------------------- | ----- |
| nightmare  | Electron                                        | 15502 |
| nightwatch | WebDriver                                       | 8135  |
| protractor | selenium                                        | 7532  |
| casperjs   | PhantomJS                                       | 7180  |
| cypress    | Electron                                        | 5303  |
| Zombie     | 不需要                                           | 4880  |
| testcafe   | 不需要                                           | 4645  |
| CodeceptJS | webdriverio                                     | 1665  |

### E2E测试框架总结

- 端到端测试一般都需要一个 Web 容器，来运行前端应用。例如 Chromium, Electron, PhantomJS, WebDriver 等等。
- 不同的web容器其能力也是不同的除了使用webdriver的方式其它的web容器都有局限性基本就相当于你能在一个固定的浏览器内核做测试，你可能发现还有不使用web容器但是其准确性堪忧
- 从速度的角度考虑：PhantomJS, WebDriver < Electon, Chromium ,webDriver headless


## selenium-webdriver

重点介绍`selenium-webdriver`

- webdriver 协议现在已经成为业内公认的浏览器 ui 测试的标准实现。几乎所有浏览器厂商都推出自己官方 driver。
- 与其他 E2E 工具相比 webdriver 技术栈有着最强的跨平台能力可以测试各种浏览器

## selenium 家族

selenium 家族还是很庞大的在这里把这些陈列除了主要为了让大家对这其有些系统的了解然后真正开发的时候只关注 selenium2.0 之后的东西就好别受到网络上纷繁的信息干扰。

![](https://images0.cnblogs.com/i/311516/201404/091114425599381.jpg)

### selenium IDE

selenium IDE 是嵌入到Firefox浏览器中的一个插件，实现简单的浏览器操作的录制与回放功能。那么什么情况下用到它呢？
快速的创建bug重现脚本，在测试人员的测试过程中，发现了bug之后可以通过IDE将重现的步骤录制下来，以帮助开发人员更容易的重现bug。
IDE录制的脚本可以可以转换成多种语言，从而帮助我们快速的开发脚本，关于这个功能后而用到时再详细介绍。

### selenium Grid

Selenium Grid是一种自动化的测试辅助工具，Grid通过利用现有的计算机基础设施，能加快Web-app的功能测试。利用Grid，可以很方便地同时在多台机器上和异构环境中并行运行多个测试事例。其特点为：
- 并行执行
- 通过一个主机统一控制用例在不同环境、不同浏览器下运行。
- 灵活添加变动测试机
 
### selenium RC

selenium RC 是selenium 家族的核心工具，selenium RC 支持多种不同的语言编写自动化测试脚本，通过selenium RC 的服务器作为代理服务器去访问应用从而达到测试的目的。

selenium RC 使用分Client Libraries和selenium Server，Client Libraries库主要主要用于编写测试脚本，用来控制selenium Server的库。

Selenium Server负责控制浏览器行为，总的来说，Selenium Server主要包括3个部分：Launcher、Http Proxy、Core。其中Selenium Core是被Selenium Server嵌入到浏览器页面中的。其实Selenium Core就是一堆JS函数的集合，就是通过这些JS函数，我们才可以实现用程序对浏览器进行操作。Launcher用于启动浏览器，把

selnium Core加载到浏览器页面当中，并把浏览器的代理设置为Selenium Server 的Http Proxy。

### selenium 2.0

搞清了selenium 1.0 的家族关系，selenium 2.0 是把WebDriver 加入到了这个家族中；简单用公式表示为：
selenium 2.0 = selenium 1.0 + WebDriver 

需要强调的是，在selenium 2.0 中主推的是WebDriver ，WebDriver 是selenium RC 的替代品，因为 selenium 为了向下兼容性，所以selenium RC 并没有彻底抛弃，如果你使用selenium开发一个新自动化测试项目，强列推荐使用WebDriver 。那么selenium RC 与webdriver 主要有什么区别呢？

selenium RC 在浏览器中运行JavaScript应用，使用浏览器内置的JavaScript 翻译器来翻译和执行selenese命令（selenese 是selenium命令集合）。

WebDriver通过原生浏览器支持或者浏览器扩展直接控制浏览器。WebDriver针对各个浏览器而开发，取代了嵌入到被测Web应用中的JavaScript。与浏览器的紧密集成支持创建更高级的测试，避免了JavaScript安全模型导致的限制。除了来自浏览器厂商的支持，WebDriver还利用操作系统级的调用模拟用户输入。


 
## 最新一代

也别受这俩干扰当然你想主动学习除外

- selenium 3.0
- webdriver.io

## 软件测试一些方法与概念

### 功能测试

测试的范围从小到大，从内到外， 从程序开发人员（单元测试）到测试人员，到一般用户Alpha/Beta测试

| 测试名称                  | 测试内容                                                                   |
| ------------------------- | -------------------------------------------------------------------------- |
| Unit Test 单元测试        | 在最低的功能/参数上验证程序的准确性,比如测试一个函数的正确性(开发人员做的) |
| Functional Test 功能测试  | 验证模块的功能 （测试人员做的）                                            |
| Integration Test 集成测试 | 验证几个互相有依赖关系的模块的功能（测试人员做的）                         |
| Scenario Test  ]场景测试  | 验证几个模块是否能完成一个用户场景（测试人员做的）                         |
| System Test 系统测试      | 对于整个系统功能的测试（测试人员做的）                                     |
| Alpha 测试                | 软件测试人员在真实用户环境中对软件进行全面的测试（测试人员做的）           |
| Beta 测试                 | 真实的用户在真实的用户环境中进行的测试, 也叫公测  （最终用户做的）         |

### 非功能测试

一个软件除了基本功能之外，还有很多功能之外的特性，这些叫“Quality of Service requirement”服务质量需求。没有软件的功能，这些特性都无从表现出来，因此，我们要在软件开发的适当阶段-基本功能完成后做这些测试。

 

| 测试名称                   | 测试内容                                                   |
| -------------------------- | ---------------------------------------------------------- |
| Stress test 压力测试       | 验证软件在超过负载设计的情况下仍能返回正确的结果，没有崩溃 |
| Load test 负载测试         | 测试软件在负载情况下能否正常工作                           |
| Performance test性能测试   | 测试软件的效能，是否提供满意的服务质量                     |
| Accessibility test         | 软件辅助功能测试-测试软件是否向残疾用户提供足够的辅助功能  |
| Localization/Globalization | 本地化/全球化测试                                          |
| Compatibility Test         | 兼容性测试                                                 |
| Configuration Test         | 配置测试-测试软件在各种配置下能否正常工作                  |
| Usability Test             | 可用性测试 –测试软件是否好用                               |
| Security Test              | 软件安全性测试                                             |


## REF
- [软件测试方法大全](https://www.cnblogs.com/TankXiao/archive/2012/02/20/2347016.html)
- [在做自动化测试前你需要知道的](https://www.cnblogs.com/fnng/p/3653793.html)
- https://wdd.js.org/e2e-testing-hacker-news-with-cypress.html
- https://www.cnblogs.com/nbkhic/p/5779453.html
