# web端 Monkeytest 工具 gremlins

在网上检索`monkey test`扑面而来的信息基本都是关于Android命令行工具`monkey test`的相关内容。那么有没有web端的`monkey test`工具呢？答案是肯定的。接下来将介绍今天的主角[gremlins](https://github.com/marmelab/gremlins.js) 是一个用JavaScript编写的强大的web端Monkeytest库。


## 开门见山

其最基本的用法如下，一行代码就可以对当前站点执行`monkey test`

```js
<script src="path/to/gremlins.min.js"></script>
<script>
gremlins.createHorde().unleash();
</script>
```
**其效果如下图**

![](https://camo.githubusercontent.com/130e101ee69d4d9b6f065df0a0404c861eb5ce18/687474703a2f2f7374617469632e6d61726d656c61622e636f6d2f746f646f2e676966)


## 核心概念

在`gremlins`中有两个核心概念`gremlin`和`mogwai`

- `gremlin`是调皮捣蛋的小精灵专门搞破坏即对当前站点做无规律的`click`,`touche`,`scroll`,表单填充。
- `mogwai`是一心向善的小精灵做一些友好的事情比如：防止`alert`弹窗阻止页面测试，记录`FPS`,终止执行过久的`monkey test`。

现在我们再看一下`gremlins.createHorde().unleash();`这行代码的含义`createHorde()`就是创建一个由`gremlin`和`mogwai`组成的游击队，`unleash()`即游击队出击。

###  gremlins & mogwai 列表

- clickerGremlin clicks anywhere on the visible area of the document
- toucherGremlin touches anywhere on the visible area of the document
- formFillerGremlin fills forms by entering data, selecting options, clicking checkboxes, etc
- scrollerGremlin scrolls the viewport to reveal another part of the document
- typerGremlin types keys on the keyboard
- alertMogwai prevents calls to alert() from blocking the test
- fpsMogwai logs the number of frames per seconds (FPS) of the browser
- gizmoMogwai can stop the gremlins when they go too far

## 使用 gremlin & mogwai

默认情况下`horde`包含所有的`gremlin`和`mogwai`你可以根据自己的需要来配置使用那些`gremlin`和`mogwai`.

**下面这段代码就代表着你使用了 formFiler clicker toucher scroller 和一个自定义的 gremlin，但是typer没有包含在其中**

```js 
  gremlins.createHorde()
  .gremlin(gremlins.species.formFiller())
  .gremlin(gremlins.species.clicker().clickTypes(['click']))
  .gremlin(gremlins.species.toucher())
  .gremlin(gremlins.species.scroller())
  .gremlin(function() {
    window.$ = function() {};
  })
  .unleash();
```
如果你只是想添加一个自定义的`gremlin`，可以使用`allGremlins`
```js
gremlins.createHorde()
  .allGremlins()
  .gremlin(function() {
    window.$ = function() {};
  })
  .unleash();
```


## 总结

[gremlins](https://github.com/marmelab/gremlins.js)是一个强力的web端`monkey test`库，更多细节大家可以[参考官方文档](https://github.com/marmelab/gremlins.js)，今天到此为止了之后会出文章介绍一下其原理和实际使用中遇到的问题。

## 深入阅读推荐

- [automate-monkey-testing-with-selenium-webdriver-io-and-mocha](https://medium.com/@jlchereau/automate-monkey-testing-with-selenium-webdriver-io-and-mocha-337ea935e308)
- [chane seed](https://chancejs.com/usage/seed.html)

