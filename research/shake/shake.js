function checkDeviceMotion() {
    return new Promise((resolve, reject) => {
        if (!window.DeviceMotionEvent) {
            return reject({ msg: '设备不支持DeviceMotion' })
        }

        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // IOS 13

            DeviceMotionEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === 'granted') {
                        resolve(true)
                    }
                })
                .catch((err) => {
                    reject({ mgs: 'IOS 13 用户未授权权限', err })
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
                (e) => {
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
        // diffTime = 0,
        speed = 0

    // 设置一个阀值
    var SHAKE_THRESHOLD = 15

    window.addEventListener('devicemotion', deviceMotionHandler, false)
    function deviceMotionHandler(event) {
        var acceleration = event.accelerationIncludingGravity
        // 获取当前时间
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

            if (speed > SHAKE_THRESHOLD) {
                cb(curTime, speed)
            }

            // 记录上一次三个方向的值
            lastX = x
            lastY = y
            lastZ = z
        }
    }
}

async function run() {
    try {
        var r = await checkDeviceMotion()
        shake(
            (a, b) => {
                console.log(a, b)
            }
            // { diffTime: 1000 }
        )
    } catch (error) {
        window.alert(error)
    }
}

run()
