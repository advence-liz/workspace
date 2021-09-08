console.log(module.i)
class Storage {
  constructor() {
    this.storage = window.sessionStorage
  }
  set(key, value, timeout = 500000) {
    if (this.get(key)) return true
    timeout = new Date().getTime() + 5000
    this.storage.setItem(key, JSON.stringify({ value, timeout }))
  }
  get(key) {
    let data = this.storage.getItem(key)
    if (!data) return null
    let { value, timeout } = JSON.parse(data)
    let now = new Date().getTime()
    if (now > timeout) {
      this.storage.removeItem(key)
      return null
    }
    return value
  }
}
var myStorage = new Storage()
window.myStorage = myStorage
myStorage.set('liz', { name: 'liz' })
myStorage.set('liz', 'dddd')
console.log(myStorage.get('liz'))

/**
 * 封装一个带过期时间的,且一定时间内不会重复设置的 sessionStorage
 * 默认过期时间为 5000 毫秒,默认不会重复设置时间间隔为 10000毫秒
 */
class Storage {
  constructor() {
    this.storage = window.sessionStorage
  }
  set(key, value, timeout = 10000) {
    if (this._get(key)) return
    timeout = new Date().getTime() + timeout
    this.storage.setItem(key, JSON.stringify({ value, timeout }))
  }
  _get(key) {
    const data = this.storage.getItem(key)
    if (!data) return null
    const { value, timeout } = JSON.parse(data)
    const now = new Date().getTime()
    if (now > timeout) {
      this.storage.removeItem(key)
      return null
    }
    return value
  }
  get(key) {
    const data = this.storage.getItem(key)
    if (!data) return null
    const { value, timeout } = JSON.parse(data)
    const now = new Date().getTime()
    if (now > timeout - 5000) {
      this.storage.removeItem(key)
      return null
    }
    return value
  }
}
