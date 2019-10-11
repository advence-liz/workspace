const redis = require('redis')
class Redis {
  constructor() {
    const client = redis.createClient()
    this.client = client
    client.set
    client.on('error', function(err) {
      console.log('Error ' + err)
      client.quit()
    })
  }
  get(...rest) {
    return this.proxy('get',...rest)
  }
  set(...rest) {
    return this.proxy('set',...rest)
  }
  expire (key,seconds){
    return this.proxy('expire',key,seconds)
  }
  close(){
    return this.proxy('quit')
  }
  proxy(method,...rest){
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
  
}

module.exports = Redis
