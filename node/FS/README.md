# FS

## REF
- [vinyl](https://github.com/gulpjs/vinyl)
## tip
- 关于文件操作的脚步最后使用 path 相关函数操作绝对路径，相对路径是以 process.cwd()定位的
- 遍历文件使用 walk.js 或者 glob

## Stream
Node.js 中有四种基本的流类型：

- Readable - 可读的流 (例如 fs.createReadStream()).
- Writable - 可写的流 (例如 fs.createWriteStream()).
- Duplex - 可读写的流 (例如 net.Socket).
- Transform - 在读写过程中可以修改和变换数据的 Duplex 流 (例如 zlib.createDeflate()).
### 对象模型
所有使用 Node.js API 创建的流对象都只能操作 strings 和 Buffer（或 Uint8Array） 对象。但是，通过一些第三方流的实现，你依然能够处理其它类型的 JavaScript 值 (除了 null，它在流处理中有特殊意义)。 这些流被认为是工作在 “对象模式”（object mode）。

在创建流的实例时，可以通过 objectMode 选项使流的实例切换到对象模式。试图将已经存在的流切换到对象模式是不安全的。