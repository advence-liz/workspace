# web端 Monkeytest gremlins

[gremlins](https://github.com/marmelab/gremlins.js) 是一个用JavaScript编写的强大的web端Monkeytest库

## 背景

最近要做web端`monkeytest`所以就对`monkeytest`方案进行漫无目的的检索最终发现基本就是两条路

- 编写selenium-webdriver脚本自己用双手实现`monkeytest`
- 使用`gremlins`
  
自己用`selenium-webdriver`实现`monkeytest`还是有点刺激的思考了5s先搁置，直接使用`gremlins`那么就需要更改网站现有逻辑也不是那么完美,但是把两种结合到一起看起来就很完美了即`selenium-webdriver`启动浏览器然后执行js脚本将`gremlins`动态的插入到站点并启动。

这么酷炫的主意当然早就人想到了具体可以参考[automate-monkey-testing-with-selenium-webdriver-io-and-mocha](https://medium.com/@jlchereau/automate-monkey-testing-with-selenium-webdriver-io-and-mocha-337ea935e308)


## 开门见山

其最基本的用法如下洋洋洒洒一行代码就可以对当前站点执行`monkey test`

```js
<script src="path/to/gremlins.min.js"></script>
<script>
gremlins.createHorde().unleash();
</script>
```

![](https://camo.githubusercontent.com/130e101ee69d4d9b6f065df0a0404c861eb5ce18/687474703a2f2f7374617469632e6d61726d656c61622e636f6d2f746f646f2e676966)

## REF
- [automate-monkey-testing-with-selenium-webdriver-io-and-mocha](https://medium.com/@jlchereau/automate-monkey-testing-with-selenium-webdriver-io-and-mocha-337ea935e308)
- document.elementFromPoint
- initEvent 不推荐使用了可以考虑fork 一份改
- [chane seed](https://chancejs.com/usage/seed.html)