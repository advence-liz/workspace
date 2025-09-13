//  promise生成函数
function log(val) {
  
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(val)
            resolve(++val)
        }, 1)
    })
    
}

var arr =[log,log,log,log]

arr.reduce((accumulator, fn) => {
    return accumulator.then(fn)
},Promise.resolve(1))