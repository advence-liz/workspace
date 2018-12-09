"use strict";
const fs = require("fs");
const Readable = require('stream').Readable;

/**
 * construct of Log
 * @class Log
 * @param {String} path - log文件输出路径
 */


function Log(path) {
    let fs, Readable, fileList, EventEmitter, self = this;


    this.log = function (msg) {
        if (msg) {
            if (msg.constructor === Array) {
                this.readable.push(`${new Date().toString()}:\n`);
                for (let i = 0; i < msg.length; i++) {
                    this.readable.push(`${i.toString()}:${msg[i].toString()}\n`);
                }

            } else {
                this.readable.push(`${new Date().toString()}:${msg}\n`);
            }
        }

        else {
            this.readable.push(msg);
        }

    };
    /**
     * 判断文件是否存在
     * @param {String} filePath 文件路径或者文件夹
     */
    this.isExists = function (filePath) {

        try {
            fs.statSync(filePath);
            this.log(`${filePath} exists`);
        } catch (error) {
            this.log(`${filePath} not find`);
        }
    };

    this.walk = function walk(path) {
        var dirList = fs.readdirSync(path);
        fileList = [];
        dirList.forEach(function (item) {
            if (fs.statSync(path + '/' + item).isDirectory()) {
            //    walk(path + '/' + item);
            } else {
                fileList.push(path + '/' + item);
            }
        });
        self.log(fileList);
    };
    this.close = function () {
         //不放在init里，防止初始化是文件夹不存在
         this.writeable = fs.createWriteStream(path);
         //必须在 push null 前
         this.readable.pipe(this.writeable);
         this.log(null);

    };
    this._init = function () {
        fs = require("fs");
        Readable = require('stream').Readable;
        EventEmitter = require('events');
        this.writeable = fs.createWriteStream(path);
        this.readable = new Readable({
            _read: function () { }
        });
        this.eventEmitter = new EventEmitter();
        fileList = [];

    };
    this._init();

}

// var stat = fs.statSync(path.join(__dirname,'content'));
// l(stat.isDirectory());//为true的话那么存在，如果为false不存在
// //检查某个文件是否存在
// try{
//     fs.statSync(path.join(__dirname, 'content/a1.txt'));
//     //如果可以执行到这里那么就表示存在了
//     console.log('haode');
// }catch(e){
//     //捕获异常
// }
// fs.access('/etc/passwd', fs.constants.R_OK | fs.constants.W_OK, (err) => {
//     console.log(err ? 'no access!' : 'can read/write');
//   });

// fs.exists('log.md', (exists) => {
//     console.log(exists ? 'it\'s there' : 'no passwd!');
// });

var log = new Log('log.md');
log.eventEmitter.once('fire', function () {
    console.log('fire');
    log.log('fire');
    log.close();
});

log.isExists('log.md');
log.isExists('log.cc');
log.walk(__dirname);
log.log('aaaaaa');
log.log('bbbbbbbbbbbb');
log.eventEmitter.emit('fire');
