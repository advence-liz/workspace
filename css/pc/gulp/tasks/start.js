const gulp = require('gulp')
const browserSync = require('browser-sync')
const reload = browserSync.reload
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')

const less = require('gulp-less')
const del = require('del')
const template = require('gulp-template')
const fs = require('fs-extra')

const { module: currentModule, root } = fs.readJsonSync('.qsrc.json')

const CurrentModulePath = path.join(root, currentModule)
// https://libraries.io/npm/postcss-pxtorem
// defaults: Browserslist’s default browsers (> 0.5%, last 2 versions, Firefox ESR, not dead).

function cleanTask () {
  return del(['app'])
}
function htmlTask () {
  return (
    gulp
      .src([path.join(CurrentModulePath, '*.html')])
      // .pipe(swig({ name: currentModule }))
      .pipe(template({ name: currentModule }))
      .pipe(gulp.dest('app'))
      .pipe(reload({ stream: true }))
  )
}
/**
 * 如果有必要可以可以扩展js 预编译
 */
function jsTask () {
  return gulp
    .src(path.join(CurrentModulePath, '*.js'))
    .pipe(gulp.dest('app'))
    .pipe(reload({ stream: true }))
}
function lessTask () {
  return (
    gulp
      .src(path.join(CurrentModulePath, '*.less'))
      // .pipe(plumber({ errorHandler: handleErrors }))
      .pipe(sourcemaps.init())
      .pipe(less())
      // .pipe(postcss(processors))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('app'))
      .pipe(reload({ stream: true }))
  )
}

// 监视 less 文件的改动，如果发生变更，运行 'less' 任务，并且重载文件
function initTask () {
  browserSync.init({
    server: {
      baseDir: ['app', 'asserts']
      // baseDir: 'app'
    },
    ui: false,
    open: false,
    notify: true
    // reloadOnRestart: true
  })
  // browserSync.reload()
  gulp.watch(path.join('src', '**', '*.less'), lessTask)
  gulp.watch(path.join(CurrentModulePath, '*.js'), jsTask)
  gulp.watch(path.join(CurrentModulePath, '*.html'), htmlTask)

  /**
   * 当使用qs命令切换当前模块的时候 browser-sync 不会稳定的刷新当前页面，所以加了下面的延迟强制刷新 hack,
   * 这个hack 的作用为在browser-sync 重新启动后强制刷新页面,如果没起效那就是电脑慢，延迟时间加点
   * reloadOnRestart: true  未达到预期效果
   */
  setTimeout(() => {
    reload()
  }, 2000)
}
gulp.task(
  'start',
  gulp.series(cleanTask, gulp.parallel(htmlTask, jsTask, lessTask), initTask)
)
