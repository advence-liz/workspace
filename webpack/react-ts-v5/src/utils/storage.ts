interface Key {
  [propKey: string]: string
}

const base = 'data.'

const keys: Key = {
  'user-info': 'user.info',
  'user-guide': 'user.guide',
  'user-guide-today': 'user.guide.today',
  'hide-video': 'hide.video',
  'notice-list': 'notice.list',
  'notice-today': 'notice.today',
}

export default class {
  // 存储
  save(key: keyof Key, val: unknown) {
    localStorage.setItem(base + keys[key], JSON.stringify(val))
  }

  // 获取
  get(key: keyof Key) {
    const offset = base + keys[key]
    const result = localStorage.getItem(offset)
    if (result) {
      return JSON.parse(result)
    }
    return null
  }

  // 移除
  remove(key: keyof Key) {
    localStorage.removeItem(base + keys[key])
  }
}
