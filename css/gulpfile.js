'use strict'
const gulp = require('gulp')
const less = require('gulp-less')
const browserSync = require('browser-sync')
const reload = browserSync.reload
const path = require('path')
const fs = require('fs-extra')
// const pxtorem = require('gulp-pxtorem')

const { module: currentModule, root } = fs.readJsonSync('.qsrc.json')
const modulePath = path.join(root, currentModule)

gulp.task('html', function () {
  return gulp
    .src([
      path.join(modulePath, 'favicon.ico'),
      path.join(modulePath, '*.html')
    ])
    .pipe(gulp.dest('app'))
})
/**
 * 如果有必要可以可以扩展js 预编译
 */
gulp.task('js', function () {
  return gulp
    .src(path.join(modulePath, '*.js'))
    .pipe(gulp.dest('app'))
    .pipe(reload({ stream: true }))
})

// gulp.src(path.join('less','dust.less'))
//         .pipe(sourcemaps.init())
//         .pipe(less())
//         .pipe(sourcemaps.write('./maps'))
//         .pipe(gulp.dest(build))
gulp.task('less', function () {
  return (
    gulp
      .src(path.join(modulePath, 'index.less'))
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
  browserSync({
    server: {
      baseDir: 'app'
    },
    open: false
  })

  gulp.watch(path.join(modulePath, '*.less'), ['less'])
  gulp.watch(path.join(modulePath, '*.js'), ['js'])
  gulp.watch(path.join(modulePath, '*.html'), ['html', reload])
})
