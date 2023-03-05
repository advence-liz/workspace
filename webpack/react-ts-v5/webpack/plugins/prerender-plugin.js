// If your plugin is direct dependent to the html webpack plugin:
const fs = require('fs-extra')
const path = require('path')
const prerenderStyle = fs.readFileSync(path.join(__dirname, '../prerender/out.css'))
const prerenderDom = fs.readFileSync(path.join(__dirname, '../prerender/out.html'))

const HtmlWebpackPlugin = require('html-webpack-plugin')
class PrerenderPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('PrerenderPlugin', (compilation) => {
      console.log('The compiler is starting a new compilation...')

      // Static Plugin interface |compilation |HOOK NAME | register listener
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'PrerenderPlugin', // <-- Set a meaningful name here for stacktraces
        (data, cb) => {
          // <!-- prerender-style -->
          // <!-- prerender-dom -->
          data.html = data.html.replace(
            '<!-- prerender-style -->',
            `<style id="prerender-style">${prerenderStyle.toString()}</style>`
          )
          data.html = data.html.replace('<!-- prerender-dom -->', prerenderDom.toString())
          // Manipulate the content
          // Tell webpack to move on
          cb(null, data)
        }
      )
    })
  }
}

module.exports = PrerenderPlugin
