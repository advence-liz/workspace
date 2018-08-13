const vfs = require('vinyl-fs')
const path = require('path')
const fs = require('fs-extra')
const yargs = require('yargs')
const chalk = require('chalk')
const shell = require('shelljs')
const inquirer = require('inquirer')

const { defaultDemo, qrcPath, root } = fs.readJsonSync('.qrc.json')
const CurrentRootPath = root
const AllModules = fs.readdirSync(CurrentRootPath)
let CurrentModule = getCurrentModule()

function main (options) {
  if (options.branch) {
    switchModule(CurrentModule, options.branch)
  } else if (options.new) {
    switchModule(defaultDemo, options.new)
  } else if (options.delete) {
    deleteModule(options.delete)
  } else if (options.list) {
    printModule()
  } else if (options.init) {
    init()
  } else {
    console.info(chalk.blue('Usage:q --help'))
  }
}
function init () {
  const questions = [
    {
      type: 'input',
      name: 'root',
      message: "What's your root",
      default: function () {
        return 'src'
      }
    },
    {
      type: 'input',
      name: 'defaultDemo',
      message: "What's your defaultDemo",
      default: function () {
        return '_demo'
      }
    },
    {
      type: 'input',
      name: 'qrcPath',
      message: "What's your qrcPath",
      default: function () {
        return './node_modules/.qrc.json'
      }
    }
  ]

  inquirer.prompt(questions).then(answers => {
    console.info(JSON.stringify(answers, null, '  '))
    fs.outputJSONSync('.qrc.json', answers)
  })
}

function getCurrentModule () {
  let CurrentModule
  try {
    CurrentModule = fs.readJsonSync(qrcPath).module
  } catch (error) {
    fs.writeJsonSync(qrcPath, { module: defaultDemo })
  }
  return CurrentModule || defaultDemo
}
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
  return vfs
    .src(path.join(CurrentRootPath, sourceModule, '**'))
    .pipe(vfs.dest(path.join(CurrentRootPath, targetModule)))
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
/**
 *  生成切换组件脚手架
 *    列出现有的component
 *  -n <name> new
 *  -b <name> branch 如果name 不存在 则新建
 *  -d <name> delete
 */
yargs.usage('Usage:q --args')
const options = yargs.options({
  new: {
    alias: 'n',
    describe: 'new',
    type: 'string'
  },
  branch: {
    alias: 'b',
    describe: 'branch 如果name 不存在 则新建',
    type: 'string'
  },
  delete: {
    alias: 'd',
    describe: 'delete',
    type: 'string'
  },
  list: {
    alias: 'l',
    describe: 'list',
    type: 'boolean'
  },
  init: {
    describe: 'init',
    type: 'boolean'
  }
}).argv
main(options)
