"use strict";
const { Transform } = require('stream');
const fs = require('fs');
const path = require('path');

class MyTransform extends Transform {
    constructor(options) {
        super(options);

    }
    /**
     * transform
     * @param {(Buffer|String)} chunk - chunkddddddddf dfdfd
     * @param {String} encoding - ech
     * @param {Function} callback - ddddddddddd
     * @desc 
     * 文件足够大的时候确实调用多次，如果我想把 aaa replace 为 bbb   如果 aaa 恰好被俩个buffer 分开了怎么搞
     * 当我把我文件变大特别大的时候debug 有点扛不住
     */
   
    _transform(chunk, encoding, callback) {
        var data = new Buffer(chunk.length);
        var str = chunk.toString('utf8');
        // for (var i = 0, offset = 0; i < str.length; i++) {
        //     if (/^[a-z]+$/.test(str[i])) {
        //         offset += data.write(str[i].toUpperCase(), offset);
        //     } else {
        //         offset += data.write(str[i], offset);
        //     }
        // }
        // this.push(data);
    
        this.push(Buffer.from(str.toUpperCase()));

        callback();
        //console.log(callback.toString());看来是个内部方法
        // function (er, data) {
        //     return afterTransform(stream, er, data);
        //   }
    }

    _flush(cb) {
        cb();
    }
}
var upper = new MyTransform();

var inFile = fs.createReadStream(path.join(__dirname,'test','lower.txt'),'utf8');

var outFile = fs.createWriteStream(path.join(__dirname,'test','upper.txt'),{defaultEncoding: 'utf8'});

inFile.pipe(upper).pipe(outFile);