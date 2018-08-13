#!/usr/bin/env node
const yargs = require('yargs')
// https://github.com/webpack/webpack-dev-server/blob/master/bin/webpack-dev-server.js
// yargs.option('n', {
//   alias: 'name',
//   demand: true,
//   default: 'tom',
//   describe: 'your name',
//   type: 'string'
// })

// const { argv } = yargs.option('c', {
//   alias: 'c',
//   demand: true,
//   default: 'ccccc',
//   describe: 'your name',
//   type: 'string'
// })
// // .option('c', {
// //   alias: 'cccc',
// //   demand: true,
// //   default: 'tom',
// //   describe: 'your name',
// //   type: 'string'
// // })
// // .argv

// console.log('hello ', argv.n, argv.c)

yargs
  .command(
    'get',
    'make a get HTTP request',
    function (yargs) {
      return yargs.option('u', {
        alias: 'url',
        describe: 'the URL to make an HTTP request to'
      })
    },
    function (argv) {
      console.log(argv.url)
    }
  )
  .help().argv

  yargs
  .command(
    'get',
    'make a get HTTP request',
    function (yargs) {
      return yargs.option('d', {
        alias: 'dtd',
        describe: 'the URL to make an HTTP request to'
      })
    },
    function (argv) {
      console.log(argv.dtd)
    }
  )
  .help().argv
