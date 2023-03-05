const Poster = require('@hfe/block-poster')
const fs = require('fs-extra')
const path = require('path')
const superagent = require('superagent')

/**
 *
 * @param {string} url
 * @param {object} params
 */
const post = (url, params = {}) => {
  return (
    superagent
      .post(url)
      // .set('Content-Type', 'application/x-www-form-urlencoded') // 使用 formdata
      .withCredentials()
      .send(params)
      .then((res) => {
        return res.body
      })
    // .catch((error) => {})
  )
}
const APIMAP = {
 
}
async function submit(html, files) {
  const pkg = fs.readJSONSync('package.json')
  const schema = fs.readJSONSync('description.json')

  const result = await post(APIMAP[process.env.PUBLISH_ENV], {
    version: pkg.version,
    name: pkg.name,
    label: pkg.name,
    schema,
    html: html,
    user: pkg.author,
    files
  })
  console.log('process.env.PUBLISH_ENV', process.env.PUBLISH_ENV)
  console.log({
    version: pkg.version,
    label: pkg.name,
    // schema: JSON.stringify(schema, null, 2),
    user: pkg.author
    // files
  })
  console.log(result)
}
class CubeGamePlugin {
  constructor(options) {}
  apply(compiler) {
    compiler.hooks.emit.tapAsync('CubeGamePlugin', async (compilation, callback) => {
      const files = {}

      // compilation.entrypoints.get('main').getFiles()
      // 0:'mainb82fb73fadc5feac87a6.css'
      // 1:'main6badaaa3200ea0600029.js'
      let entrypoints = { js: [], css: [] }
      const assets = { js: [], css: [] }
      /**
       * 只考虑单入口项目
       * 多入口返回的是一个Map
       * {
       *   "main": [
       *     "mainb82fb73fadc5feac87a6.css",
       *     "main6badaaa3200ea0600029.js"
       *   ]
       * }
       */

      compilation.entrypoints.forEach((value, key) => {
        value.getFiles().forEach((file) => {
          if (/.js$/.test(file)) {
            entrypoints.js.push(`https:////${file}`)
          }
          if (/.css$/.test(file)) {
            entrypoints.css.push(`https://${file}`)
          }
        })
      })

      compilation.getAssets().forEach((item) => {
        delete item.source
        delete item.info
        if (/.js$/.test(item.name)) {
          assets.js.push(item.name)
        }
        if (/.css$/.test(item.name)) {
          assets.css.push(item.name)
        }
      })

      for (var filename in compilation.assets) {
        if (/.html$/.test(filename)) {
          await submit(compilation.assets[filename].source(), { assets, entrypoints })
          continue
        }
        if (/.(html|json)$/.test(filename)) continue
        files[filename] = Buffer.from(compilation.assets[filename].source())
      }
      const publish = true
      const timeout = 10000
      const group = 'hfe'
      const repoName = 'game'
      await Poster(files, publish, timeout, group, repoName)

      const filesText = JSON.stringify({ assets, entrypoints }, null, 2)
      compilation.assets['files.json'] = {
        source: function () {
          return filesText
        },
        size: function () {
          return filesText.length
        }
      }
      callback()
    })
  }
}

module.exports = CubeGamePlugin
