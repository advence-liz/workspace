const gulp = require('gulp')
const browserSync = require('browser-sync')
const reload = browserSync.reload
const path = require('path')
const plumber = require('gulp-plumber')
const less = require('gulp-less')
const handleErrors = require('../util/handleErrors')
const fs = require('fs-extra')
// const fileinclude = require('gulp-file-include')

const template = require('gulp-template')
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
    .on('end', () => {
      reload()
    })
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
  return (
    gulp
      .src(path.join(CurrentModulePath, '*.less'))
      .pipe(plumber({ errorHandler: handleErrors }))
      .pipe(less())
      // .pipe(
      //   pxtorem({
      //     rootValue: 37.5,
      //     unitPrecision: 5,
      //     // propList: ['*'],
      //     propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
      //     selectorBlackList: [],
      //     replace: true,
      //     mediaQuery: false,
      //     minPixelValue: 0
      //   })
      // )
      // .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('app'))
      .pipe(reload({ stream: true }))
  )
})

// 监视 less 文件的改动，如果发生变更，运行 'less' 任务，并且重载文件
gulp.task('start', ['less', 'js', 'html'], function () {
  //   try {
  //     fs.emptyDirSync('app')
  //   } catch (error) {}

  browserSync.init({
    server: {
      baseDir: 'app'
    },
    open: true
  })
  // browserSync.reload()
  gulp.watch(path.join(CurrentModulePath, '*.less'), ['less'])
  gulp.watch(path.join(CurrentModulePath, '*.js'), ['js'])
  gulp.watch(path.join(CurrentModulePath, '*.html'), ['html'])
  //   reload()
  //   gulp.watch('app/*.html').on('change', reload)
})
