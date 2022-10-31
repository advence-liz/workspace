
## 倒计时
```js
function padNumber(num, fill = 2) {
  //改自：http://blog.csdn.net/aimingoo/article/details/4492592
  var len = ('' + num).length;
  return Array(fill > len ? fill - len + 1 || 0 : 0).join(0) + num;
}
/**
 * 
 * @param {*} endDate 
 * @param {*} callback 
 * @example
 * countTime(
 *   new Date(new Date().getTime() + 1000 * 60 * 30),
 *   ({ d, h, m, s }, done) => {
 *     if (done) {
 *       this.pre.visible = false;
 *       this.countDown.visible = false;
 *       this.after.visible = false;
 *       this.done.visible = true;
 *     } else {
 *       this.countDown.text = `${h}:${m}:${s}`;
 *     }
 *   }
 * );
 */
function countTime(endDate, callback) {
  //获取当前时间
  var now = new Date().getTime();
  //设置截止时间
  var end = endDate.getTime();
  //时间差
  var leftTime = end - now;

  //定义变量 d,h,m,s保存倒计时的时间
  var d, h, m, s;
  var done = false;
  if (leftTime > 0) {
    d = padNumber(Math.floor(leftTime / 1000 / 60 / 60 / 24));
    h = padNumber(Math.floor((leftTime / 1000 / 60 / 60) % 24));
    m = padNumber(Math.floor((leftTime / 1000 / 60) % 60));
    s = padNumber(Math.floor((leftTime / 1000) % 60));
  } else {
    d = '00';
    h = '00';
    m = '00';
    s = '00';
    done = true;
  }
  callback({ d, h, m, s }, done);
  setTimeout(countTime, 1000, endDate, callback);
}

export default countTime;

```
## debouce
```js
/**
 * 
 * @example
 *  submit = debouce(this._submit, 800, true, 10, '点击太过频繁')
 */

function debouce(fn, wait, immediate = false, max = 10, msg) {
    var timer = null
    var timeStrat = new Date().getTime()
    var times = 0
    return function(...args) {
        if (immediate && !timer) {
            timer = setTimeout(fn.bind(this), 0, ...args)
        } else {
            clearTimeout(timer)
            timer = setTimeout(fn.bind(this), wait, ...args)
        }
        // 记录点击次数
        times++
        var now = new Date().getTime()
        // console.log(times, max)
        if (times >= max) {
            window.Block.trigger('infopop', msg)
            times = 0
        }
        if (now >= timeStrat + wait) {
            times = 0
            timeStrat = now
        }
    }
}
export default debouce

```

## inView & outView

```js
function isInView (el) {
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight 
    const top = el.getBoundingClientRect() && el.getBoundingClientRect().top
    console.log('top', top)
    return top  <= viewPortHeight + 100
}

function isOutView (el) {
    const { top, height } = this.$refs.$root.getBoundingClientRect()

     return top + height < 0
}

```
## localstorage

```js
var seed = `cube_storage_${window.Block.ID}`

function setItem(key, value) {
  if (window.Block.EDIT) return
  var store = getItem()
  store[key] = value
  localStorage.setItem(seed, JSON.stringify(store))
}

function getItem(key) {
  var store = localStorage.getItem(seed)
  store = store ? JSON.parse(store) : {}
  return key ? store[key] : store
}

module.exports = {
  setItem,
  getItem
}

```
## styleSheets
```js
class StyleSheet {
  constructor(name = 'dynamic-styleSheet') {
    this.styleSheet = this.getStyleSheet(name)
  }

  getStyleSheet(name) {
    // 判断目标样式标签是否存在，不存在则创建,为什么不用id区分，因为id 不成，具体原因并没深究
    if (!document.getElementById(name)) {
      const style = document.createElement('style')
      style.title = name
      document.getElementsByTagName('head')[0].appendChild(style)
    }

    let styleSheet = null
    for (let i = 0; i < document.styleSheets.length; i++) {
      styleSheet = document.styleSheets[i]
      if (styleSheet.title === name) {
        break
      }
    }
    return styleSheet
  }
  insertRule(css, index) {
    return this.styleSheet.insertRule(css, index)
  }
  deleteRule(index) {
    this.styleSheet.deleteRule(index)
  }
}
export default StyleSheet

const styleSheet = new StyleSheet()
// window.styleSheet = styleSheet

const handle = styleSheet.insertRule('h1{color:red;}', 0)

// // styleSheet.deleteRule(0)
// // styleSheet.insertRule('h1{color:blue;}', 0)

```

## groupBy
```js
function groupBy(list, name) {
  return list.reduce((obj, item) => {
    if (!obj[item[name]]) {
      obj[item[name]] = []
      obj[item[name]].push(item)
    } else {
      obj[item[name]].push(item)
    }
    return obj
  }, {})
}

const g = groupBy(list, 'name')
```
## shake

```js
function checkDeviceMotion() {
    return new Promise((resolve, reject) => {
        if (!window.DeviceMotionEvent) {
            return reject({ msg: '设备不支持摇一摇' })
        }

        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // IOS 13
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        resolve(true)
                    } else {
                        reject({ msg: 'IOS用户未开启权限' })
                    }
                })
                .catch(err => {
                    reject({ msg: 'IOS 获取用户授权信息失败', err })
                })
        } else {
            /**
             * 其他支持加速度检测的系统
             * 设备如果支持 window.DeviceMotionEvent，开始一个事件监测（这里注意加速度获取时特别敏感，哪怕我们认为我们的手机静止了也会有一些加速给它，所以devicemotion这个事件会时时触发，触发间隔极小），如果该事件没有执行，说明用户关闭了动作和方向的权限。
             */
            let timer = setTimeout(function() {
                reject({ msg: '非IOS用户未开启权限' })
            }, 500)

            window.addEventListener(
                'devicemotion',
                e => {
                    clearTimeout(timer)
                },
                { once: true }
            )
            window.addEventListener('devicemotion', () => {
                resolve(true)
            })
        }
    })
}

function shake(cb, opts = {}) {
    const { diffTime = 1000 } = opts
    // 变量初始化
    var x = 0,
        y = 0,
        z = 0,
        lastX = 0,
        lastY = 0,
        lastZ = 0,
        curTime = 0,
        lastTime = 0,
        speed = 0

    // 设置一个阀值
    var SHAKE_THRESHOLD = 15

    window.addEventListener('devicemotion', deviceMotionHandler, false)
    function deviceMotionHandler(event) {
        var acceleration = event.accelerationIncludingGravity
        // 获取当前时间
        if (!lastTime) lastTime = new Date().getTime()
        curTime = new Date().getTime()
        // 计算时间差，当这个差值大于一定值执行计算三个方向的速度
        if (curTime - lastTime > diffTime) {
            // 记录上一次的时间
            // diffTime = curTime - lastTime
            lastTime = curTime

            // 获取当前三个方向的值
            x = acceleration.x
            y = acceleration.y
            z = acceleration.z

            // 计算速度，为了防止出现负数，进行绝对值
            speed = Math.abs(x + y + z - lastX - lastY - lastZ)
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/visibilityState
            // 加速度超过阙值而页面可见执行回调
            if (speed > SHAKE_THRESHOLD && document.visibilityState === 'visible') {
                cb(curTime, speed)
            }

            // 记录上一次三个方向的值
            lastX = x
            lastY = y
            lastZ = z
        }
    }
}

module.exports = { checkDeviceMotion, shake }

```

## DateFormat
```js
/**
 * Date Format 根据下面链接改的 不想挂在Date 原型上简单封装一下
 * http://www.bitscn.com/school/Javascript/201610/751698.html
 * @param {Date} Date defualt new Date();
 * @example
 * dateFormat.format(new Date(),"yy-mm-dd")
 */
class DateFormat {
    setDate(date) {
        this.date = date
        if (!this.isValidDate()) {
            throw 'You must pass in a valid Date Object'
        }

        return this
    }
    isValidDate() {
        return !isNaN(this.date.getDay())
    }
    format(date, fmt) {
        this.setDate(date)
        var o = {
            'M+': this.date.getMonth() + 1, // 月份
            'd+': this.date.getDate(), // 日
            'h+': this.date.getHours(), // 小时
            'm+': this.date.getMinutes(), // 分
            's+': this.date.getSeconds(), // 秒
            'q+': Math.floor((this.date.getMonth() + 3) / 3), // 季度
            S: this.date.getMilliseconds() // 毫秒
        }
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
            }
        }
        return fmt
    }
}
export default new DateFormat()

```

## debouce

```js
//     submit = debouce(this._submit, 800, true, 10, '点击太过频繁')

function debouce(fn, wait, immediate = false, max = 10, msg) {
    var timer = null
    var timeStrat = new Date().getTime()
    var times = 0
    return function(...args) {
        if (immediate && !timer) {
            timer = setTimeout(fn.bind(this), 0, ...args)
        } else {
            clearTimeout(timer)
            timer = setTimeout(fn.bind(this), wait, ...args)
        }
        // 记录点击次数
        times++
        var now = new Date().getTime()
        // console.log(times, max)
        if (times >= max) {
            window.Block.trigger('infopop', msg)
            times = 0
        }
        if (now >= timeStrat + wait) {
            times = 0
            timeStrat = now
        }
    }
}
export default debouce

```

## REM

```js
/**
 * 工具函数将数值自动转为rem
 * @param {object} styleObject
 * @example
 * css2rem({"top":0,"left":0,right:"-111"})
 * >>
 * {top: "0rem", left: "0rem", right: "-1.11rem"}
 */
const range = new Set(['zIndex', 'z-index'])

const css2rem = _styleObject => {
    // let styleObject = JSON.parse(JSON.stringify(_styleObject))
    let styleObject = { ..._styleObject }
    for (let key in styleObject) {
        let val = styleObject[key]
        if (styleObject.hasOwnProperty(key) && !range.has(key) && val.constructor === Number) {
            styleObject[key] = `${val / 100}rem`
        }
    }
    return styleObject
}

export default css2rem


```
## insertParam
```js
function insertParam(key, value, search) {
    key = escape(key)
    value = escape(value)
    var kvp = search.substr(1).split('&')
    if (kvp == '') {
        return '?' + key + '=' + value
    } else {
        var i = kvp.length
        var x
        while (i--) {
            x = kvp[i].split('=')

            if (x[0] == key) {
                x[1] = value
                kvp[i] = x.join('=')
                break
            }
        }

        if (i < 0) {
            kvp[kvp.length] = [key, value].join('=')
        }
    }
    return '?' + kvp.join('&')
}
export default insertParam

```
## parseUrl

```JS
const parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/

function parseUrl(uri) {
  try {
    const result = parse_url.exec(uri)
    const [url, scheme, slash, host, port, path, query, hash] = result
    return { url, scheme, slash, host, port, path, query, hash }
  } catch (error) {
    return {}
  }
}
```

## 适配

```js
// 750/1334 0.562
    let scaleType = innerWidth / innerHeight < 750 / 1334 ? 'width' : 'height';
    let scale = 1;
    if (scaleType === 'width') {
      scale = (innerWidth / 750).toFixed(2);
      this.stage = new Hilo.Stage({
        width: 750,
        height: innerHeight / scale,
        scaleX: scale,
        scaleY: scale
      });
    } else {
      scale = (innerHeight / 1334).toFixed(2);
      this.stage = new Hilo.Stage({
        width: innerWidth / scale,
        height: 1334,
        scaleX: scale,
        scaleY: scale
      });
    }
```    

## 去除微信表情防止乱码

```js
            /**
             * 1.将字符串解码，中文和表情会解码会转为 unicode
             * 2.将 unicode 中非中文部分替换为 "X"
             */
 getUserName(item) {
        const str = item.userName
        const reg = /\u\w{4}/
        let res = ''
        let strArr = str.split('')
        for (let s of strArr) {
            if (reg.test(escape(s)) && !/[\u4e00-\u9fa5]/.test(s)) {
                res += 'X'
            } else {
                res += s
            }
        }
        return res
    }
```
## 剪切板
```js
  /* const textArea = document.createElement('textarea')
            textArea.setAttribute('readonly', 'readonly')
            textArea.style.position = 'fixed'
            textArea.style.left = '-10000vw'
            textArea.style.top = '-10000vh'
            textArea.style.outline = 'none'
            textArea.style.background = 'transparent'
            textArea.style.display = 'opacity'
            textArea.style.border = 'none'
            textArea.innerText = this.groupPw
            document.body.appendChild(textArea)
            let range, selection
            if (Agent.iphone) {
                range = document.createRange()
                range.selectNodeContents(textArea)
                selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
                textArea.setSelectionRange(0, 999999)
            } else {
                textArea.select()
            }
            try {
                const successful = document.execCommand('copy')
                const msg = successful ? '口令复制成功' : '口令复制失败'
                if (!successful) {
                    Helper.raptorLog(
                        {
                            name: 'copyShareCommand',
                            msg: '口令复制失败'
                        },
                        JSON.stringify({
                            // 自定义上报内容
                            userInfo: this.userInfo
                        })
                    )
                }
                this.$trigger('infopop', msg)
                successful &&
                    KNB.openPage({
                        url: 'weixin://'
                    })
            } catch (err) {
                this.$trigger('infopop', '不支持点击复制到剪贴板')
                Helper.raptorLog(
                    {
                        name: 'copyShareCommand',
                        msg: '不支持点击复制到剪贴板'
                    },
                    JSON.stringify({
                        // 自定义上报内容
                        // 自定义上报内容
                        userInfo: this.userInfo,
                        err
                    })
                )
            }
            document.body.removeChild(textArea)*/
```

## xhr

```js
   return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest()
        xhr.open('get', url)
        xhr.timeout = 2500
        //   xhr.onerror =
        //   xhr.ontimeout =
        xhr.onload = function() {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.response))
          } else {
            reject({ code: -1, msg: '网络异常' })
          }
        }
        xhr.send()
      })
```

## 插入 vconsole
```js
function loadScript(url, onload, opt) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = opt ? opt.async || false : false
    script.defer = opt ? opt.defer || false : false
    script.crossOrigin = 'anonymous'
    script.src = url
    if (onload) {
        script.onload = onload
    }
    document.body.appendChild(script)
}

loadScript('https://unpkg.com/vconsole@latest/dist/vconsole.min.js', function() {
    new window.VConsole()
})
```
## 生成随机数

```js
function randomString(e = 4) {
    let t = 'abcdefhijkmnprstwxyz0123456789'
    let a = t.length
    let n = ''
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
    return n
}
```

## Postmessage

```js

postMessage = (val: object) => {
    setTimeout(() => {
      this.iframeWindow.postMessage(
        { source: 'cube-preview-data', payload: JSON.stringify(val) },
        '*'
      )
    }, 800)
  }


window.addEventListener('message', receiveMessage, false)
function receiveMessage(event) {
  //   {
  //     source: 'cube-preview-data',
  //     payload: {}
  //   }

  // debugger
  // For Chrome, the origin property is in the event.originalEvent
  // object.
  // 这里不准确，chrome没有这个属性
  var origin = event.origin || event.originalEvent.origin
  // if (origin.includes('sankuai.com') || origin === window.origin) return
  // if (origin.includes('sankuai.com') || origin === window.origin) return

  // ...
  // const { source, payload } = (event.data && JSON.parse(event.data)) || {}
  // console.log('source', source)
  // console.log('payload', payload)
  // window.postMessage({
  //   source: 'cube-preview-data',
  //   payload: '{"v":1}'
  // })

  if (event.data && event.data.source === 'cube-preview-data') {
    console.log('previewConfig', event.data.payload)
    sessionStorage.setItem('previewConfig', event.data.payload)
  }
}
```

## 删除url 参数

```js
 

// hash: "uuid"
// host: "dev.sankuai.com"
// path: undefined
// port: undefined
// query: "userid=1&uuid=1"
// scheme: "https"
// slash: "//"
// url: "https://dev.sankuai.com/cccc/aaa?userid=1&uuid=1#uuid"
function parseUrl (uri) {
    const parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
    const result = parse_url.exec(uri);
    const [url, scheme, slash, host, port, path, query, hash] = result;
    return { url, scheme, slash, host, port, path, query, hash: hash ? '#' + hash : ''};
}

function del (url, ...names) {
    const { query, hash} = parseUrl(url);
    const baseUrl = url.split('?')[0];
    let search = query;
    let res = url;
    if (search && names.length) {
        let obj = {};
        let arr = search.split('&');
        for (let i = 0; i < arr.length; i++) {
            let [queryKey, queryVal] = arr[i].split('=');
            if (names.indexOf(queryKey) === -1) {
                obj[queryKey] = queryVal;
            }
        }

        res =
            baseUrl +
            '?' +
            JSON.stringify(obj)
                .replace(/["{}]/g, '')
                .replace(/:/g, '=')
                .replace(/,/g, '&') + hash;
    }
    return res;
}
module.exports = del;


```

## vscode 

```js
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Egg Debug",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run",
                "debug",
                "--",
                "--inspect-brk"
            ],
            "console": "integratedTerminal",
            "restart": true,
            "protocol": "auto",
            "port": 9229,
            "autoAttachChildProcesses": true
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Egg Test",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run",
                "test-local",
                "--",
                "--inspect-brk"
            ],
            "protocol": "auto",
            "port": 9229,
            "autoAttachChildProcesses": true
        },
        {
            "type": "node",
            "request": "attach",
            "name": "Egg Attach to remote",
            "localRoot": "${workspaceRoot}",
            "remoteRoot": "/usr/src/app",
            "address": "localhost",
            "protocol": "auto",
            "port": 9999
        }
    ]
}
```