// https://www.haorooms.com/post/js_deepcompare
// typeof null === 'object'
// typeof obj1
// 基础  基础
// 对象  基础
// 对象  对象

// null 是一个特例那么就兼容处理这个特例

function isObject(obj) {
    if (obj === null) {
        return false
    } else {
        return typeof obj === 'object'
    }
}

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true
    else {
        if (isObject(obj1) && isObject(obj2)) {
            if (Object.keys(obj1).length !== Object.keys(obj2).length)
                return false

            for (let key in obj1) {
                if (!deepEqual(obj1[key], obj2[key])) return false
            }
            return true
        } else {
            return obj1 === obj2
        }
    }

    // if(typeof)
}

var r1 = deepEqual(1, 1)
console.log(r1, true)

var r2 = deepEqual({ liz: 1 }, { liz: 1 })
console.log(r2, true)

var r3 = deepEqual(null, null)
console.log(r3, true)

var r4 = deepEqual(1, null)
console.log(r4, false)

var r5 = deepEqual({ arr: [1, 3, 4], v: 1 }, { arr: [1, 3, 4], v: 1 })
console.log(r5, true)
