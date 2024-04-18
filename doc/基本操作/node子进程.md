- https://juejin.im/post/5b83f3f8f265da43464b100f
- [tree-kill]
- [node学习笔记程序员小卡](https://github.com/chyingp/nodejs-learning-guide)
- [node 实践-子进程](https://juejin.im/post/5ab3b867f265da237b220133)
- [node 子进程](https://segmentfault.com/a/1190000016169207)


## 子进程输出

shelljs 封装的exec 默认也会将信息输出到主进程

```js
var {spawn ,execSync,spawnSync }= require('child_process');
var ls = spawnSync('git', ['lg'], {
    stdio: 'inherit'
});

// ls.on('close', function(code){
//     console.log('child exists with code: ' + code);
// });

// const shell = require('shelljs')

// shell.exec('git lg')

// const { execSync } = require("child_process")

// execSync('git lg')
```

 
 
 ## 杀死子进程
 
 实现这一目标的最安全的方法是创建一个派生进程来终止信号，使用child.pid作为参数。
 ```js
var process; // https://cloud.tencent.com/developer/ask/41734
process = require('child_process');

var fork, child;
fork = process.fork;
child = fork('./index');

var spawn;
spawn = process.spawn;
spawn('kill', [child.pid]);
console.log('sending SIGTERM to child process (socket server)');
```
 
 ```bash

process.kill() 这个方法名可能会让初学者感到困惑，其实它并不是用来杀死进程的，而是用来向进程发送信号。举个例子：

console.log('hello');

process.kill(process.pid, 'SIGHUP');

console.log('world');
输出如下，可以看到，最后一行代码并没有执行，因为向当前进程发送 SIGHUP 信号，进程退出所致。

hello
[1]    50856 hangup     node kill.js
```


主进程 build  子进程 stdin ignore stdout log   stderr 

```js
简单的一个示例：把子进程的输出都存放到文件中const fs = require('fs')
const cp = require('child_process')

// 使用文件描述符，让子进程的输出都重定向到文件中
let outFd = fs.openSync('./child.out', 'a')
let errFd = fs.openSync('./child.err', 'a')

let childProcess = cp.spawn('./child',[], {
	detached: true,
	stdio: ['ignore', outFd, 'pipe']
})


```