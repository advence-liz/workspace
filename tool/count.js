const fs = require('fs')
var str = fs.readFileSync('./t.md').toString()
// // const args = process.argv.slice(2)
// console.log(args)
// var str = args[0]

var arr = str.split(/\n+/).filter(Boolean)
var taskMap = new Map()
var reg = /([\u4e00-\u9fa5]+)[^\d]+(\d+)/
for (let str of arr) {
    if (!reg.test(str)) {
        continue
    }
    var [all, task, day] = str.match(reg)
    var current = taskMap.get(task) || 0
    // console.log(task, day)
    taskMap.set(task, current + Number(day))
}
var sum = 0
taskMap.forEach(function (val, key) {
    console.log(key, ':', val)
    sum = sum + val
})
console.log('总计:', sum)
