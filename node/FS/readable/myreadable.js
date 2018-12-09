"use strict";
const Readable = require('stream').Readable;

// Stream 实现
class MyReadable extends Readable {
  constructor(dataSource, options) {
    super(options);
    this.dataSource = dataSource;
  }
  // 继承了 Readable 的类必须实现这个函数
  // 触发系统底层对流的读取
  _read() {
    const data = this.dataSource.makeData();
    this.push(data);
  }
}

// 模拟资源池
const dataSource = {
  data: new Array(10).fill('-'),
  // 每次读取时 pop 一个数据
  makeData() {
    if (!dataSource.data.length) return null;
    return dataSource.data.pop();
  }
};

const myReadable = new MyReadable(dataSource);
// myReadable.setEncoding('utf8');
// myReadable.on('data', (chunk) => {
//   console.log(chunk);
// });

myReadable.on('readable', () => {
  let chunk;
  while (null !== (chunk = myReadable.read())) {
    console.log(`Received ${chunk.length} bytes of data.`);
  }
});

/**
 * on data flow 模式，感觉就是自动的循环返回 read 的返回值
 * on readable     手动调用read（read 会触发调用 _read or _read  自己会 反复调用 直到返回null
 */