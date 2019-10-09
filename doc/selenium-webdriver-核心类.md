# 核心类

总体来说 selenium-webdriver node版本API设计有很强的面向对象的感觉，如果遇到某些问题你找不多对应node版的资料，推荐你看对应java版或者C#b版


WebDriver
ThenableWebDriver

Each WebDriver instance provides automated control over a browser session.

api
```bash
Instance Methods
this.actions( options ) → Actions
this.close() → Promise<undefined>
this.execute( command ) → Promise<(T|null)>
this.executeAsyncScript( script, ...args ) → IThenable<(T|null)>
this.executeScript( script, ...args ) → IThenable<(T|null)>
this.findElement( locator ) → WebElementPromise
this.findElements( locator ) → Promise<Array<WebElement>>
this.get( url ) → Promise<undefined>
this.getAllWindowHandles() → Promise<Array<string>>
this.getCapabilities() → Promise<Capabilities>
this.getCurrentUrl() → Promise<string>
this.getExecutor() → Executor
this.getPageSource() → Promise<string>
this.getSession() → Promise<Session>
this.getTitle() → Promise<string>
this.getWindowHandle() → Promise<string>
this.manage() → Options
this.navigate() → Navigation
this.quit() → Promise<undefined>
this.setFileDetector( detector ) → void
this.sleep( ms ) → Promise<undefined>
this.switchTo() → TargetLocator
this.takeScreenshot() → Promise<string>
this.wait( condition, timeout, message ) → (IThenable<T>|WebElementPromise)
Static Functions
WebDriver.createSession( executor, capabilities, onQuit ) → WebDriver
```



WebElement
WebElementPromise

Represents a DOM element. WebElements can be found by searching from the document root using a WebDriver instance, or by searching under another WebElement:


api
```bash
Instance Methods
this.clear() → Promise<undefined>
this.click() → Promise<undefined>
this.findElement( locator ) → WebElementPromise
this.findElements( locator ) → Promise<Array<WebElement>>
this.getAttribute( attributeName ) → Promise<(string|null)>
this.getCssValue( cssStyleProperty ) → Promise<string>
this.getDriver() → WebDriver
this.getId() → Promise<string>
this.getRect() → Promise<{height: number, width: number, x: number, y: number}>
this.getTagName() → Promise<string>
this.getText() → Promise<string>
this.isDisplayed() → Promise<boolean>
this.isEnabled() → Promise<boolean>
this.isSelected() → Promise<boolean>
this.sendKeys( ...args ) → Promise<undefined>
this.submit() → Promise<undefined>
this.takeScreenshot( scroll ) → Promise<string>
Static Functions
WebElement.buildId( id, noLegacy ) → Object
WebElement.equals( a, b ) → Promise<boolean>
WebElement.extractId( obj ) → string
WebElement.isId( obj ) → boolean
```

综上几乎所有的API都是异步的，那么下面的代码就不太科学合理

```js
// code 1
 driver.get('http://www.google.com');
 var searchForm = driver.findElement(By.tagName('form'));
 var searchBox = searchForm.findElement(By.name('q'));
 searchBox.sendKeys('webdriver');

```

这样看起来就合理了

```js
// code 2
 driver.get('http://www.google.com');
 driver.findElement(By.tagName('form')).then(searchForm=>{
        return searchForm.findElement(By.name('q'))
    }).then(searchBox=>{
        searchBox.sendKeys('webdriver')
    })

```

观察`this.findElement( locator ) → WebElementPromise`的返回类型是WebElementPromise并不是简单地的WebElement

在看看WebElementPromise的官方解析

WebElementPromise is a promise that will be fulfilled with a WebElement. This serves as a forward proxy on WebElement, allowing calls to be scheduled without directly on this instance before the underlying WebElement has been fulfilled. In other words, the following two statements are equivalent:

```js
driver.findElement({id: 'my-button'}).click();
driver.findElement({id: 'my-button'}).then(function(el) {
   return el.click();
 });
```

总结起来就是WebElementPromise是WebElement的超集,给我们提供了语法糖让我们可以链式的书写获取到DOM元素之后的操作,让`code1`的写法变成可行合理的。同理`ThenableWebDriver`和`WebDriver`也是类似的关系。



现在更推荐基本ES6`async&await`写法,那么`WebElementPromise`的威力就没有那么大了。

```js
await driver.get('http://www.google.com');
var searchForm =  await driver.findElement(By.tagName('form'));
var searchBox = await searchForm.findElement(By.name('q'));
await searchBox.sendKeys('webdriver');
```