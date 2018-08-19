const path = require('path')
const fs = require('fs-extra')
const yargs = require('yargs')
const { red, blue, green } = require('chalk')
const shell = require('shelljs')
const inquirer = require('inquirer')
const ConfigOutputPath = '.qsrc'
// const moduleStorePath = './node_modules/.qrc.json'
function main (options) {
  if (options.branch) {
    const { currentModule } = getConfig()
    switchModule(currentModule, options.branch)
  } else if (options.new) {
    const { defaultDemo } = getConfig()
    switchModule(defaultDemo, options.new)
  } else if (options.delete) {
    deleteModule(options.delete)
  } else if (options.list) {
    printModule()
  } else if (options.init) {
    init()
  } else {
    console.info(blue('Usage: q --help'))
  }
}

function getConfig () {
  let config, currentModule
  if (fs.pathExistsSync(path.resolve(process.cwd(), ConfigOutputPath))) {
    config = fs.readJsonSync(path.resolve(process.cwd(), ConfigOutputPath))
    const { moduleStorePath, defaultDemo } = config
    currentModule = getCurrentModule(moduleStorePath, defaultDemo)
    return { ...config, currentModule }
  } else {
    console.info(red(`can not found ${ConfigOutputPath}`))
    console.info(blue('use: q --init'))
    process.exit(0)
  }
}
function getCurrentModule (moduleStorePath, defaultDemo) {
  let currentModule
  try {
    currentModule = fs.readJsonSync(moduleStorePath).module
  } catch (error) {
    console.info('use: q --eslint or q -b <name>')
  }

  return currentModule || defaultDemo
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
      name: 'moduleStorePath',
      message: "What's your moduleStorePath",
      default: function () {
        return './node_modules/.qsrc.json'
      }
    }
  ]

  inquirer.prompt(questions).then(answers => {
    const { moduleStorePath, defaultDemo } = answers
    console.info(JSON.stringify(answers, null, '  '))
    fs.outputJSONSync(ConfigOutputPath, answers)
    fs.outputJsonSync(moduleStorePath, { module: defaultDemo })
  })
}
function printModule () {
  const { currentModule, root } = getConfig()
  const allModules = fs.readdirSync(root)
  allModules.forEach(item => {
    let isFile = /\./g.test(item)
    if (item === currentModule) {
      !isFile && console.info(green(item))
    } else {
      !isFile && console.info(item)
    }
  })
}
function switchModule (currentModule, nextModule) {
  const { root } = getConfig()
  const allModules = fs.readdirSync(root)
  if (currentModule === nextModule) {
    console.info(
      red('The target module cannot be equal to the current module!')
    )
    return
  }
  if (allModules.indexOf(nextModule) > -1) {
    rewriteModule(nextModule)
    return
  }
  if (nextModule) {
    createModule(currentModule, nextModule)
    rewriteModule(nextModule)
  }
}
function rewriteModule (nextModule) {
  const { moduleStorePath } = getConfig()
  fs.writeJson(moduleStorePath, { module: nextModule })
  console.info(
    green(`Successfully written ${nextModule} to ${moduleStorePath}`)
  )
}
function createModule (sourceModule, targetModule) {
  const { root } = getConfig()
  console.log(root)
  console.log(path.join(root, sourceModule))
  if (!fs.pathExistsSync(path.join(root, sourceModule))) {
    console.info(red(`${sourceModule} directory not found`))
    process.exit(0)
  }
  if (sourceModule === targetModule) {
    console.info(
      red('The target module cannot be equal to the current module!')
    )
    process.exit(0)
  }

  shell.exec(
    `cp -r ${path.join(root, sourceModule)} ${path.join(root, targetModule)}`
  )
  console.info(green(`create ${targetModule} from ${sourceModule}`))
  // return vfs
  //   .src(path.join(root, sourceModule, '**'))
  //   .pipe(vfs.dest(path.join(root, targetModule)))
  //   .on('end', () => {
  //     console.info(green(`create ${targetModule} from ${sourceModule}`))
  //   })
}
function deleteModule (targetModule) {
  const { root, defaultDemo } = getConfig()
  if (targetModule === defaultDemo) {
    console.info(red('The demo directory should not be removed!'))
    return
  }
  shell.rm('-rf', path.join(root, targetModule))
  console.info(green(`${targetModule} successfully deleted`))
}
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
