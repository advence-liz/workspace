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
