// sparrow
const gulp = require('gulp')
const path = require('path')
const fs = require('fs-extra')
const argv = require('yargs').argv
const chalk = require('chalk')
const shell = require('shelljs')
const getCurrentModule = require('../util/getCurrentModule')

const { defaultDemo, qrcPath, root } = require('../config').q
const CurrentRootPath = root
const AllModules = fs.readdirSync(CurrentRootPath)
let CurrentModule = getCurrentModule()

/**
 *  生成切换组件脚手架
 *   q 列出现有的component
 *  -n <name> new
 *  -b <name> switch 如果name 不存在 则新建
 *  -d <name> delete
 */
gulp.task('q', function () {
  // console.log(argv)
  if (argv.b) {
    switchModule(CurrentModule, argv.b)
    return
  } else if (argv.n) {
    switchModule(defaultDemo, argv.n)
    return
  } else if (argv.d) {
    deleteModule(argv.d)
    return
  }
  printModule()
})
function printModule () {
  AllModules.forEach(item => {
    let isFile = /\./g.test(item)
    if (item === CurrentModule) {
      !isFile && console.info(chalk.green(item))
    } else {
      !isFile && console.info(item)
    }
  })
}
function switchModule (currentModule, nextModule) {
  // console.log(currentModule, nextModule)
  if (currentModule === nextModule) {
    console.info(
      chalk.red('The target module cannot be equal to the current module!')
    )
    return
  }
  if (AllModules.indexOf(nextModule) > -1) {
    changePackge(nextModule)
    return
  }
  if (nextModule) {
    createModule(currentModule, nextModule)
    changePackge(nextModule)
  }
}
function changePackge (nextModule) {
  // pkg.module = nextModule
  // let packageText = beautify(JSON.stringify(pkg))
  // fs.writeFileSync(path.join('package.json'), packageText)
  fs.writeJson(qrcPath, { module: nextModule })
  console.info(chalk.green(`Successfully written ${nextModule} to .qrc.json`))
}
function createModule (sourceModule, targetModule) {
  if (sourceModule === targetModule) {
    console.info(
      chalk.red('The target module cannot be equal to the current module!')
    )
    return
  }
  return gulp
    .src(path.join(CurrentRootPath, sourceModule, '**'))
    .pipe(gulp.dest(path.join(CurrentRootPath, targetModule)))
    .on('end', () => {
      console.info(chalk.green(`create ${targetModule} from ${sourceModule}`))
    })
}
function deleteModule (targetModule) {
  if (targetModule === 'demo') {
    console.info(chalk.red('The demo directory should not be removed!'))
    return
  }
  shell.rm('-rf', path.join(CurrentRootPath, targetModule))
  console.info(chalk.green(`${targetModule} successfully deleted`))
}
