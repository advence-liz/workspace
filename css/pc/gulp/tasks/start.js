const gulp = require('gulp')
const browserSync = require('browser-sync')
const reload = browserSync.reload
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')
const plumber = require('gulp-plumber')
const less = require('gulp-less')
const pxtorem = require('postcss-pxtorem')
const postcss = require('gulp-postcss')

const fs = require('fs-extra')
// const fileinclude = require('gulp-file-include')

const template = require('gulp-template')
const handleErrors = require('../util/handleErrors')
const config = require('../config')
let { options } = config.styles
const processors = [
  // autoprefixer(options.autoprefixer),
  pxtorem(options.pxtorem)
]
const { module: currentModule, root } = fs.readJsonSync('.qsrc.json')

const CurrentModulePath = path.join(root, currentModule)
// https://libraries.io/npm/postcss-pxtorem
// defaults: Browserslist’s default browsers (> 0.5%, last 2 versions, Firefox ESR, not dead).

gulp.task('html', function () {
  // console.log(currentModule, CurrentModulePath)
  return gulp
    .src([path.join(CurrentModulePath, '*.html')])
    .pipe(template({ name: currentModule }))
    .pipe(gulp.dest('app'))
    .pipe(reload({ stream: true }))
})
/**
 * 如果有必要可以可以扩展js 预编译
 */
gulp.task('js', function () {
  return gulp
    .src(path.join(CurrentModulePath, '*.js'))
    .pipe(gulp.dest('app'))
    .pipe(reload({ stream: true }))
})

gulp.task('less', function () {
  return gulp
    .src(path.join(CurrentModulePath, '*.less'))
    .pipe(plumber({ errorHandler: handleErrors }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('app'))
    .pipe(reload({ stream: true }))
})

// 监视 less 文件的改动，如果发生变更，运行 'less' 任务，并且重载文件
gulp.task('start', ['less', 'js', 'html'], function () {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
    open: false,
    notify: true
    // reloadOnRestart: true
  })
  // browserSync.reload()
  gulp.watch(path.join(CurrentModulePath, '*.less'), ['less'])
  gulp.watch(path.join(CurrentModulePath, '*.js'), ['js'])
  gulp.watch(path.join(CurrentModulePath, '*.html'), ['html'])

  /**
   * 当使用qs命令切换当前模块的时候 browser-sync 不会稳定的刷新当前页面，所以加了下面的延迟强制刷新 hack,
   * 这个hack 的作用为在browser-sync 重新启动后强制刷新页面,如果没起效那就是电脑慢，延迟时间加点
   * reloadOnRestart: true  未达到预期效果
   */
  setTimeout(() => {
    reload()
  }, 2000)
})
