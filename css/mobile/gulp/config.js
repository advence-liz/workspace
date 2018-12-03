const path = require('path')
module.exports = {
  styles: {
    src: 'src/index.less',
    dest: { prod: 'dist/css', dev: 'build/css' },
    options: {
      pxtorem: {
        rootValue: 37.5,
        unitPrecision: 5,
        propList: [
          '*',
          '!letter-spacing',
          '!border',
          '!border-top',
          '!border-left',
          '!border-right',
          '!border-bottom'
        ],
        selectorBlackList: [],
        replace: true,
        mediaQuery: false,
        minPixelValue: 0
      },
      autoprefixer: {
        browsers: ['> 1%', 'ios 6', 'android 4']
        // cascade: true
      }
    }
  },
  base64: {
    imagesSoucePath: 'images/**/!(*@3x).png',
    lessName: 'index.less',
    src: path.join('src', 'images', 'base64.less'), // pre:base64 的出口，base64 的入口
    dest: 'src/images/',
    getName (fileName) {
      return `q-${fileName.replace(/(@|\s|\dx)/g, '').replace(/_/g, '-')}`
    },
    options: {
      baseDir: 'images',
      extensions: ['png'],
      maxImageSize: 20 * 1024, // bytes
      debug: true // 如果不开启debug 如果文件没有找到也没有输出静默执行
    }
  },
  q: {
    defaultDemo: '_demo',
    qrcPath: '.qsrc.json'
  }
}
