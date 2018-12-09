# 由webpack引发的前端自动化讲解

## 对NODE的误解

- NODE 肯定是几个前端工程师在实验室里捣鼓出来的。
- 为了后端而后端，有意思吗？
- 怎么又发明了一门新语言？
- javascript 承担的责任太重了
- 直觉上，JavaScript不应该运行在后端
- 前端工程师要逆袭了
## 图灵完备语言
一切可计算的问题都能计算，这样的虚拟机或者编程语言就叫图灵完备的。

一个能计算出每个图灵可计算函数（Turing-computable function）的计算系统被称为图灵完备的。一个语言是图灵完备的，意味着该语言的计算能力与一个通用图灵机 （Universal Turing Machine）相当，这也是现代计算机语言所能拥有的最高能力。

现在的计算机编程语言都是图灵完全（完备）的。

因此，这世上也不存在一种语言可以做，而另一种语言不可以做的事儿

## NODE
Ryan Dahl 是一名资深的程序员，在创造出NODE之前，他的主要工作都是围绕高性能Web服务器进行的。经历过一些尝试和失败之后，他找到了设计高性能Web服务器的几个要点：事件驱动，非阻塞I/O.

经过C,Lua,Haskell,Ruby,javascript等权衡最终选择的了javascript。

起初，Ryan Dahl称她的项目为web.js,就是一个Web服务器，但是项目的发展超过了他最初构想，变成了一个构建网络应用的基础框架。每个NODE进程都构成网络应用中的一个节点，这就是NODE名字所含意义的真谛。

虽然NODE这么酷炫但是我们都不用我们只用它写脚本。

### Chrome&Node
![](http://auifw.avepoint.net/pic/chrome_node.png)

- [Electron](https://electron.atom.io/)
- [node-webkit](https://github.com/nwjs/nw.js)
- [React Native](http://reactnative.cn/cases.html)
### NODE&Browser&W3C&ECMASCRIPT

![](http://auifw.avepoint.net/pic/node_w3c.png)
## NPM
npm 即node的安装包管理工具(就像nuget之于.NET,pip之于python)

[npm 命令手册](http://javascript.ruanyifeng.com/nodejs/npm.html#toc1)

- npm -v 显示版本信息
- npm install <packageName> [--save]?
```
$ npm install sax@latest
$ npm install sax@0.1.1
$ npm install sax@">=0.1.0 <0.2.0"
```
- npm update
- npm -l //查看每个命令的用法
- npm info npm

- npm run 

```
npm install eslint  uglify-js --save
"scripts": {
  "lint": "eslint script.js ",
  "compile": "babel script.js",
  "uglifyjs ":"uglifyjs inet.js -o inet-min.js",
  "template": "node bin/templete.js",
  "launch": "launch.cmd",
  "build":"npm run lint &&npm run compile&&npm run launch"
},


```
## 指令&数据

这两个概念在计算机世界无处不在，一般数据的载体的就是文件，而这个文件在一定的环境下又变成了指令。如：一个HTML文件放在服务器上就是数据，而当浏览器获取了它，并将其解析绚丽的页面它就成了指令。

而前端主要由三种数据组成，HTML,CSS,JS，因此前端自动化就是用脚步自动化处理前端所涉及的数据（文件）。

而这个脚步呢就用NODE写，其一前端开发对JS技术栽比较熟悉容易上手，其二NODE社区灰常活跃你基本能找到你想要的所有东西。

不过大家在网上检索前端自动化，基本都会感觉前端自动化是grunt，gulp，webpack...,或者因为NODE才有了前端自动化。

其实一直都存在，只是之前更多的是java，python...的实现，就像现在找寻一些工具基本也都是java，python，ruby 版的。

## 前端自动化都做什么

- 压缩CSS，js。
- 预编译HTML，JS，CSS 前端涉及到的语言。HTML ，CSS 抽象程度比较低为了更高效的开发一般 HTML，css 由 jade，less 等DSL(Domain Specific Language)编译而成。
- 语法检查，格式整理，自动刷新页面等其它功能。
当前主流的所有工具，基本都会提供两种调用方式： **CLI & NODEAPI**
## 命令行程序

### PATH
```
PATH=
C:\Windows\system32;
C:\Windows;C:\Windows\System32\Wbem;
C:\Windows\System32\WindowsPowerShell\v1.0\;
C:\Program Files (x86)\nodejs\;
C:\Program Files\Git\cmd;
C:\Program Files\dotnet\;
C:\Program Files\TortoiseGit\bin;C:\Users\Zhuo.Li\AppData\Local\Programs\Python\Python35\Scripts\;
C:\Users\Zhuo.Li\AppData\Local\Programs\Python\Python35\;
C:\Users\Zhuo.Li\AppData\Roaming\npm;
```
### PATHEXT
```bash
C:\Users\Zhuo.Li>echo %PATHEXT%
.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC
```
### Hello World
```bash
echo  Hello World
```
### node 全局命令调用方式
```bash
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\gulp\bin\gulp.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\node_modules\gulp\bin\gulp.js" %*
)
```

## 模块组织
随着javascript发展，从增强显示的脚本到解决一类问题的库，然后构建应用，一个有效的模块加载方案也就成为了必须的元素。
因为当想用一个语言构建一个大型应用，模块机制不可或缺。
- 浏览器端运用最广泛的为 AMD 规范
- 服务端使用 CommonJS 规范
- 而ES6 Module 加载规范不远的将来将要统一前后端（我们要是采用ES6 加载规范）

-[javascript模块化编程](http://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html)



### 关于javascriptIDE 目前功能薄弱的思考
javascript 尤其运行在浏览器端并没标准统一的入口，通过简陋的\<script\>标签引入，所以无法判断一个文件中出现的对象该有何种行为，而且script 还可能是动态加载的。
必然不能像其他语言那样智能检验差错与提示，如果以后模块化编程根深蒂固，javascriptIDE也会像其他语言一样强大。
有必要的话兴许还能实时预览，因为现在集成webkit渲染引擎开发桌面的应用正在蓬勃发展（比如我正在使用的vscode）





## AMD 

```javascript
define(['module1', 'module2'], function(m1, m2) {

    return {
        method: function() {
            m1.methodA();
			m2.methodB();
        }
    };

});

require(['foo', 'bar'], function ( foo, bar ) {
        foo.doSomething();
});
```
## cmomonjs
```javascript
//index.js
const m1=require("module1");

m1.dosomething()
.........

//module1
......

module.exports={
dosomething:function(){
    ....
}
}

```

## ES6
### import
```javascript
//import
import { stat as _stat, exists, readFile } from 'fs';

//由于import是静态执行，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法结构。
// 报错
import { 'f' + 'oo' } from 'my_module';

// 报错
let module = 'my_module';
import { foo } from module;

// 报错
if (x === 1) {
  import { foo } from 'module1';
} else {
  import { foo } from 'module2';
}
//上面三种写法都会报错，因为它们用到了表达式、变量和if结构。在静态分析阶段，这些语法都是没法得到值的。
```
### export
```javascript
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;
//上面代码是profile.js文件，保存了用户信息。ES6 将其视为一个模块，里面用export命令对外部输出了三个变量。

//export的写法，除了像上面这样，还有另外一种。

// profile.js
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export {firstName as _firstName, lastName, year};


```
### export default
```javascript
/ export-default.js
export default function () {
  console.log('foo');
}
上面代码是一个模块文件export-default.js，它的默认输出是一个函数。

其他模块加载该模块时，import命令可以为该匿名函数指定任意名字。

// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

### aui.js
```javascript
"use strict";

var aui ={
    version:'1.0.0'
}
function func(){

    return aui.version;
}
//export default aui;
export default func;
```
### widget.js
```javascript
var combobox = {
    name:'combobox'
}

var dialog = {
    name:'dialog'
}

export { combobox,dialog}
```
### index.js
```javascript
import aui from './aui';

import {combobox,dialog as _dialog} from './widget';

console.dir(combobox.name);

console.log(_dialog.name);

console.dir(func());
```
### index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="./lib/library1"></script>
    <script src="./lib/library2"></script>
    <script src="global.common.js"></script>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
   
    <script type="text/javascript" src="index.js"></script>
  </body>   
</html>
```
## webpack
webpack 是一个现代的 JavaScript 应用程序的模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图表(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成少量的 bundle - 通常只有一个，由浏览器加载。

它是高度可配置的，但是，在开始前你需要先理解四个核心概念：入口(entry)、输出(output)、loader、插件(plugins)。
> 使用配置文件的用法
 webpack [--config webpack.config.js]
```bash
$ webpack --config example.config.js
```


>不使用配置文件的用法
webpack <entry> [<entry>] <output>

```bash
$ webpack src/index.js dist/bundle.js
```
> NODE API
```javascript
const webpack = require("webpack");

webpack({
  // 配置对象
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    // 在这里处理错误
  }
  // 处理完成
});
```

### webpackConfig

```javascript
//webpack.config.js

var pkg = require("./package"),
    options = process.argv,
    config;

/**
 * pkg.pattern {dev|prod} 原计划package.json 中配置是否为product 目前没有使用
 */
config = require("./webpack." + pkg.env);
module.exports = config;
```
```javascript
//var webpack = require('webpack');
var path = require("path"),
    HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        bundle: "./src/hello.js",
        // react:"./src/react.js",
        index:"./webpack_demo/index.js"
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: "[name].js"

    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     enforce: "pre",
            //     loader: "eslint-loader"
            // },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader'
                }]
            }]

    },
    context: __dirname,
    devtool: "source-map",
    target: "web",
    resolve: {
        // options for resolving module requests
        // (does not apply to resolving to loaders)
        modules: [
            "node_modules",
            path.resolve(__dirname, "node_modules")
        ],
        // directories where to look for modules
        extensions: [".js", ".json", ".jsx", ".css"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'template/_layout.html'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, "build"),
        compress: true,
        port: 9000
    }

};
```



## gulp
- [gulp入门教程](http://blog.csdn.net/xllily_11/article/details/51393569)
- [gulp-ruanyifeng](http://javascript.ruanyifeng.com/tool/gulp.html#toc3)
- [gulpjs](http://www.gulpjs.com.cn/docs/)
```
const gulp = require('gulp');
const eslint = require('gulp-eslint');
 
gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths. 
    // So, it's best to have gulp ignore the directory as well. 
    // Also, Be sure to return the stream from the task; 
    // Otherwise, the task may end before the stream has finished. 
    return gulp.src(['**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property 
        // of the file object so it can be used by other modules. 
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console. 
        // Alternatively use eslint.formatEach() (see Docs). 
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failAfterError last. 
        .pipe(eslint.failAfterError());
});
 
gulp.task('default', ['lint'], function () {
    // This will only run if the lint task is successful... 
});
```

## grunt
```
require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks 
 
grunt.initConfig({
    eslint: {
        target: ['file.js']
    }
});
 
grunt.registerTask('default', ['eslint']);
```

-------
![](http://auifw.avepoint.net/pic/saber.gif)

# DEMO
## CLI_DEMO
### helloworld
```bash
echo  Hello World
```
![](http://auifw.avepoint.net/pic/cli_demo.gif)

## ESlint(主要演示npm命令)

### npm init

![](http://auifw.avepoint.net/pic/npm-init.gif)

### npm install

![](http://auifw.avepoint.net/pic/npm-install.gif)
### node index.js

![](http://auifw.avepoint.net/pic/node-run.gif)

### package.json
```
{
  "name": "eslint-demo",
  "version": "1.0.0",
  "description": "a demo for eslint",
  "main": "index.js",
  "scripts": {
    "test": "npm run test"
  },
  "author": "liz",
  "license": "ISC",
  "dependencies": {
    "eslint": "^3.19.0"
  }
}
```
### index.js
```
"use strict";
var CLIEngine = require("eslint").CLIEngine;

var cli = new CLIEngine({
    envs: ["browser", "mocha"],
    useEslintrc: false,
    rules: {
        semi: 2
    }
});

// lint the supplied text and optionally set
// a filename that is displayed in the report
var report = cli.executeOnText("test.js");
console.dir(report);
```
## run webpack
![](http://auifw.avepoint.net/pic/run_webpack.gif)
## run webpack-dev-server
![](http://auifw.avepoint.net/pic/run_webpack_server.gif)
## webpack NODEAPI
### js
```javascript
const webpack = require("webpack");
//const pkg = require("../package");
const webpack_config= require("../webpack.dev.js")

webpack(webpack_config, (err, stats) => {
    console.log(stats.toString());
//   if (err || stats.hasErrors()) {
//     // 在这里处理错误
//   }
  // 处理完成
});
```
### webpack.config
```javascript
//var webpack = require('webpack');
var path = require("path"),
    HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry: {
        bundle: "./src/hello.js",
        // react:"./src/react.js",
        index:"./webpack_demo/index.js"
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: "[name].js"

    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     enforce: "pre",
            //     loader: "eslint-loader"
            // },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader'
                }]
            }]

    },
    context: __dirname,
    devtool: "source-map",
    target: "web",
    resolve: {
        // options for resolving module requests
        // (does not apply to resolving to loaders)
        modules: [
            "node_modules",
            path.resolve(__dirname, "node_modules")
        ],
        // directories where to look for modules
        extensions: [".js", ".json", ".jsx", ".css"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'template/_layout.html'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, "build"),
        compress: true,
        port: 9000
    }

};
```
## 运行展示
![](http://auifw.avepoint.net/pic/webpack_nodeapi.gif)
## HtmlWebpackPlugin
### _layout.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="http://cdn.bootcss.com/react/15.4.2/react.js"></script>
    <script src="http://cdn.bootcss.com/react/15.4.2/react-dom.js"></script>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
     <jspath>
  </body>
</html>
```
### template.js
```javascript
const fs=require("fs");
const path= require("path");
/**
 * 此处readFile&writeFile 没有使用相对路径，因为如果是相对路径，是相对于当前进程所在的路径（process.cmd()），而不是相对于当前脚本所在的路径。
 */
var fileName= path.resolve(__dirname,'_layout.html');
var distPath = path.resolve(__dirname,'index.html');
var template = fs.readFileSync(fileName, 'utf8');

template = template.toString().replace(/<jspath>/,`<script src="bundle.js"></script>`);

fs.writeFile(distPath,template,(err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});
```
### index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="http://cdn.bootcss.com/react/15.4.2/react.js"></script>
    <script src="http://cdn.bootcss.com/react/15.4.2/react-dom.js"></script>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
     <script src="bundle.js"></script>
  </body>
</html>
```



# 废稿

## javascript
1995年5月，Brendan Eich只用了10天，就设计完成了这种语言的第一版。它是一个大杂烩，语法有多个来源：

基本语法：借鉴C语言和Java语言。
数据结构：借鉴Java语言，包括将值分成原始值和对象两大类。
函数的用法：借鉴Scheme语言和Awk语言，将函数当作第一等公民，并引入闭包。
原型继承模型：借鉴Self语言（Smalltalk的一种变种）。
正则表达式：借鉴Perl语言。
字符串和数组处理：借鉴Python语言。
为了保持简单，这种脚本语言缺少一些关键的功能，比如块级作用域、模块、子类型（subtyping）等等，但是可以利用现有功能找出解决办法。这种功能的不足，直接导致了后来JavaScript的一个显著特点：对于其他语言，你需要学习语言的各种功能，而对于JavaScript，你常常需要学习各种解决问题的模式。而且由于来源多样，从一开始就注定，JavaScript的编程风格是函数式编程和面向对象编程的一种混合体。
## first-class

### 通常，编程语言会限制操作计算元素的途径。带有最少限制的元素被称为具有一等地位。一些一等元素的“权利和特权”是：

- 它们可以绑定到名称。
- 它们可以作为参数向函数传递。
- 它们可以作为函数的返回值返回。
- 它们可以包含在好素具结构中。
## ES6 的模块自动采用严格模式，不管你有没有在模块头部加上"use strict"
- 变量必须声明后再使用
- 函数的参数不能有同名属性，否则报错
- 不能使用with语句
- 不能对只读属性赋值，否则报错
- 不能使用前缀0表示八进制数，否则报错
- 不能删除不可删除的属性，否则报错
- 不能删除变量delete prop，会报错，只能删除属性delete global[prop]
- eval不会在它的外层作用域引入变量
- eval和arguments不能被重新赋值
- arguments不会自动反映函数参数的变化
- 不能使用arguments.callee
- 不能使用arguments.caller
- 禁止this指向全局对象
- 不能使用fn.caller和fn.arguments获取函数调用的堆栈
- 增加了保留字（比如protected、static和interface）