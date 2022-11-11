## 监听信号
```js
['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close();
        process.exit();
      });
    });
```

## 判断程序是否独立运行

```js
if (!module.parent) {
// ran with `node something.js`
app.listen(8088, function() {
console.log('app listening on port 8088');
})
} else {
// used with `require('/.something.js')`
module.exports = app;
}

if (require.main === module) {
  printInFrame(process.argv[2], process.argv[3]);
} else {
  module.exports = printInFrame;
}

```

## 读取文件内容
```js
/**
       * @var {Object} routes josn-server 路由对象
       * @description
       *  const routes = require(path.resolve(filePath))
       *  上面的写法会走缓存，如果文件以及修改了变拿不到新值
       */

      delete require.cache[filePath]
      const routes = require(filePath)
```

## 获取用户根目录

```js
process.env.HOME 
```
## 


openssl req -new \
  -sha256
  -key server-key.key.pem \
  -out server-csr.pem \
  -subj "/C=CN/ST=Guandong/L=Shenzhen/O=YH Inc/CN=localhost"
  
  
## 获取文件父目录
 
 ```js
const name = path
.parse(source)
.dir.split('/')
.slice(-1)
```
  
  
  
 ## ask
  
 
```js
const readline = require('readline')

function question(text) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise(function(resolve, reject) {
        rl.question(text, answer => {
            resolve([answer, rl])
        })
    })
}
async function ask(q) {
    const [answer, rl] = await question(q)
    rl.close()

    return answer
}

// use
const answer = await ask(blue(`${name}已经存在是否覆盖？(Y/N)`))

        if (answer.toLowerCase() === 'n') return
```

## promiseify

```js
 proxy(method,...rest){
    // return promisify(this.client[method].bind(this.client))(...rest)
    return this.promisify(this.client[method],this.client)(...rest)
  }
  /**
   * 让一个遵循异常优先的回调风格的函数，即 (err, value) => ... 回调函数是最后一个参数，返回一个返回值是一个 promise 版本的函数。
   * @param {function} method 
   * @param {object} context 函数运行上下文
   */
  promisify(method,context){
    return (...rest)=>{
      const currentMethod= method.bind(context,...rest)
      const startTime = new Date().getTime()
      return new Promise((resolve, reject) => {
        currentMethod((err,result)=>{
          const endTime = new Date().getTime()
          if(err) reject(err)
          console.log(method.name,':',rest,'>>:',result,`${endTime-startTime}ms`)
          resolve(result)
        })
      })
    }
   
  }
```

## 打印对象

```js
var inspect = require('util').inspect
console.log(inspect(webpackConfig, false, null, true))
```
## 获取端口号

```js
const { spawnSync } = require('child_process')

const getPort = (port = 3000) => {
  let isPortSelected = false
  while (!isPortSelected) {
    if (spawnSync('lsof', [`-i:${port}`]).stdout.toString()) {
      port++
    } else {
      isPortSelected = true
    }
  }
  return port
}
module.exports = getPort

```

```js
const net = require('net')

const BASEPORT = 8000
const HIGHTPORT = 65535

function getPort(basePort, highestPort) {
  basePort = Number(basePort) || BASEPORT
  highestPort = Number(highestPort) || HIGHTPORT
  const server = net.createServer().listen(basePort)
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      if (basePort >= highestPort) {
        reject(new Error('No open ports available'))
      }
      server.close()
      resolve(basePort)
    })
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        resolve(getPort(basePort + 1, highestPort))
      } else {
        reject(err)
      }
    })
  })
}

```
## 获取IP

```js
function getIPAddress() {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address
      }
    }
  }
}

module.exports = getIPAddress

```

## color
不难发现样例中的关键的代码是类似 \033[42;30m 这种格式的，换成大白话的写法就是 \033[背景色编号;字色编号m 。

字色编号：30黑，31红，32绿，33黄，34蓝，35紫，36深绿，37白色
背景编号：40黑，41红，42绿，43黄，44蓝，45紫，46深绿，47白色

033 x1B等效
```js
const exec = require('child_process').execSync

const bulue = x=>{
    return `\033[34m${x}`
}
const green = x =>{
    return `\x1B[32m${x}`
}

function execWrap(cmd){
console.log(bulue(new Date().toString()) ,green(cmd))
// execSync返回的是buffer，不调用toString无法正常显示
const result = exec(cmd)
console.log(result.toString())
}
```

## 改变子进程环境变量

```js
var execSync = require("child_process").execSync;

var SEPARATOR = process.platform === 'win32' ? ';' : ':';
var env = Object.assign({}, process.env);

env.PATH = path.resolve('./node_modules/.bin') + SEPARATOR + env.PATH;

function myExecSync(cmd) {
  var output = execSync(cmd, {
    cwd: process.cwd(),
    env: env
  });

  console.log(output);
}

myExecSync('eslint .');
```
## json.stringify
```js
const fs = require('fs-extra')
const pkg = require('./package.json')

fs.writeFileSync('package1.json', JSON.stringify(pkg, null, 2))

```

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

## 输出到文件

```js
    const fs = require('fs')
    fs.writeFileSync('list.json',JSON.stringify(component,null,2))
    
    
 
 const { execSync } = require('child_process');
                var log = {path: tpl.path, version: tpl.version, realPath}
                var inspect = require('util').inspect
              
                execSync(`echo "${inspect(log, false, null, true)}" >> list.md`)
             
```

## 获取git 信息

```js
const exec = require('child_process').execSync
module.exports = () => {
  let name
  let email

  try {
    name = exec('git config --get user.name')
    email = exec('git config --get user.email')
  } catch (e) { }

  name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
  email = email && email.toString().trim()
  return {
    name,
    email
  }
}
```

## git 下载指定目录

```js
const shell = require('shelljs')
const fs = require('fs-extra')
const path = require('path')
const downloadTemplate = function(cwd, target, branch) {
  shell.exec('git init', { cwd })
  shell.exec(
    'git remote add -f origin ssh://git@git.xxxx.com/xxx/xxx.git',
    {
      cwd
    }
  )
  shell.exec('git config core.sparsecheckout true', { cwd })
  shell.exec(`echo packages/${target}-template >> .git/info/sparse-checkout`, {
    cwd
  })
  console.log(`git pull origin ${branch}`)
  shell.exec(`git pull origin ${branch}`, { cwd })
}
/**
 *
 * @param {*} name
 * @param {*} target
 */
module.exports = async (name, target, branch) => {
  const tempPath = path.resolve('temp')
  fs.ensureDirSync(tempPath)
  downloadTemplate(tempPath, target, branch)
  fs.copySync(tempPath + `/packages/${target}-template`, path.resolve(name))
  fs.removeSync(tempPath)
}

```