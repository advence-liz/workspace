## 垃圾回收

- [v8链接回收](https://www.jianshu.com/p/6e38b56ecff6)
- [V8内存浅析](https://brightc.netlify.app/2019/08/04/v8%E5%86%85%E5%AD%98%E6%B5%85%E6%9E%90/) 易懂版
- [node 性能提升](https://juejin.cn/post/6844903733432680455)
- [解读v8 GC](https://developer.aliyun.com/article/592878)

## 开启主动 gc
```js
process.memoryUsage(); // 查看当前占用的内存，主要关心heapUsed字段，大小约为4.4MB
node --expose-gc // --expose-gc 表示允许手动执行垃圾回收机制
global.gc()

```

## node 进程与线程

[深入浅出 node 进程与线程](https://cloud.tencent.com/developer/article/1483507)

## node 性能分析 
本节将介绍如何使用 v8-profiler 分析 CPU 的使用情况。
v8-profiler
- [](https://wizardforcel.gitbooks.io/node-in-debugging/content/1.2.html)

## node 内存监控
- [memwatch](https://wizardforcel.gitbooks.io/node-in-debugging/content/2.3.html)
- nest-status-monitor
## cpu 占用率

[](https://blog.jcix.top/2019-04-25/cpu-util-is-wrong/)

```js

let count = 1
const memwatch = require('memwatch-next')
memwatch.on('stats', (stats) => { 
  console.log(count++, stats)
})
memwatch.on('leak', (info) => {
  console.log('---')
  console.log(info)
  console.log('---')
})

const http = require('http')
const server = http.createServer((req, res) => {
  for (let i = 0; i < 10000; i++) {
    server.on('request', function leakEventCallback() {})
  }
  res.end('Hello World')
  global.gc()
}).listen(3000)
```


## Q&A

### cpu 占用率等价于 cpu 占用时间吗

不，CPU占用率与CPU占用时间不是等价的概念。

CPU占用率是指在一定时间内，CPU处于工作状态的时间占总时间的比例。它是一个百分比值，用来表示CPU的工作负载情况。

CPU占用时间则是指CPU实际工作的时间长度，通常以秒为单位。

简而言之，CPU占用率是一个比例，而CPU占用时间是一个具体的时间长度。两者虽然都与CPU的工作状态有关，但表达的含义和计量方式不同。

cpu 占用率如何计算

CPU占用率的计算通常是通过监控一段时间内CPU的工作时间与总时间的比例来实现的。具体步骤如下：

确定监控周期：首先确定一个监控周期，比如1秒、5秒等。这个周期是计算CPU占用率的时间窗口。

计算工作时间：在这个周期内，统计CPU处于非空闲状态的时间总和。非空闲状态包括执行用户代码、系统代码等。

计算总时间：总时间即为监控周期的长度，例如如果监控周期是1秒，那么总时间就是1秒。

计算CPU占用率：将CPU的工作时间除以总时间，然后乘以100得到百分比，即为CPU占用率。

公式可以表示为：

[ \text{CPU占用率} = \left( \frac{\text{CPU工作时间}}{\text{总时间}} \right) \times 100% ]

在实际操作中，操作系统或者监控工具通常会提供相应的接口或命令来直接获取CPU占用率，无需手动计算。例如，在Linux系统中，可以使用top、vmstat等命令查看CPU占用率。

### io 内存是什么意思，举例说明

IO内存（Input/Output Memory）指的是用于输入输出操作的内存区域，主要用于存储临时数据，以便于CPU和外部设备之间的数据交换。IO内存可以看作是一种缓冲区，它帮助协调CPU处理速度与外部设备数据传输速度之间的差异。

举例说明：

假设有一个文件读写的操作。当你从硬盘读取一个文件时，操作系统会将文件数据从硬盘传输到内存中的一个特定区域（即IO内存），然后CPU可以从这个内存区域读取数据进行处理。同样地，当你向硬盘写入数据时，数据首先被写入到IO内存中，然后再从IO内存传输到硬盘上。

这里的IO内存充当了一个中介的角色，确保了数据在CPU和硬盘之间高效地传输。由于硬盘的读写速度通常比CPU处理速度慢，使用IO内存作为缓冲可以减少CPU的等待时间，提高整体的系统性能。

另一个例子：

网络通信也是IO内存使用的一个场景。当计算机通过网络接收数据时，数据包首先被存储在网络接口的IO内存中，然后操作系统将数据从IO内存转移到应用程序指定的内存区域。这个过程中，IO内存作为接收数据的缓冲区，确保了数据的顺利接收和传输。

总的来说，IO内存是操作系统管理输入输出操作的一个重要组成部分，它通过作为缓冲区来优化和加速数据的传输过程。

## v8 单位时间内 gc 次数越少越好吗

不一定。V8引擎的垃圾回收（GC）机制是为了自动管理内存使用，避免内存泄漏，确保应用程序的健康运行。单位时间内GC次数的多少，需要根据实际情况来评估其好坏。

GC次数较少可能意味着：

应用程序的内存管理做得比较好，产生的垃圾较少，因此需要较少的GC来清理。

垃圾回收的触发阈值设置得较高，导致较少触发GC，这可能会暂时提高程序性能，但如果内存使用接近或达到上限时，可能会突然触发大量GC，导致程序性能急剧下降。

GC次数较多可能意味着：

应用程序产生大量短命对象，频繁分配和回收内存，导致GC次数增多。

垃圾回收的触发阈值设置得较低，导致频繁触发GC，这可能会增加CPU的负担，影响程序的性能。

因此，判断GC次数的多少是否“好”，需要结合应用程序的具体情况和性能指标来综合评估。理想的情况是通过优化程序的内存使用，达到一个平衡点，既不会因为GC次数过少而导致内存使用过高，也不会因为GC次数过多而频繁影响程序性能。

### v8 gc 时间越短越好吗

是的，V8引擎的垃圾回收（GC）时间越短越好。

V8引擎的垃圾回收机制会暂停JavaScript的执行（称为“停顿时间”或“暂停时间”），以便进行内存清理。这个过程中，如果GC时间过长，会直接影响到应用程序的响应速度和性能。特别是在需要高实时性的应用场景中，如游戏、交互式应用等，长时间的GC停顿会导致用户体验明显下降。

因此，优化GC时间，减少GC的停顿时间，是提高应用性能和用户体验的重要方向。V8引擎也在不断地优化其垃圾回收机制，比如引入增量标记（Incremental Marking）、延迟清理（Lazy Sweeping）和并行垃圾回收等技术，以减少GC的停顿时间。

总的来说，GC时间越短，对应用程序的性能和用户体验的影响越小，因此是更加理想的状态。开发者也应当通过合理的内存管理和性能调优，尽量减少GC的负担，从而缩短GC的时间。
chrome debug node 用的是 chrome 的v8 而不是 node v8吗？
不是的。当我们说在 Chrome 浏览器中调试 Node.js 应用时，实际上是利用了 Chrome DevTools 这一调试工具来连接到 Node.js 进程。Node.js 应用本身运行的是 Node.js 的 V8 引擎。Node.js 和 Chrome 浏览器都使用了 V8 引擎作为 JavaScript 的执行环境，但是它们各自维护自己的 V8 引擎实例。
简而言之，即使是在 Chrome 浏览器中调试 Node.js 应用，Node.js 应用也是运行在 Node.js 的 V8 引擎上，而不是 Chrome 的 V8 引擎。Chrome DevTools 仅仅作为一个强大的界面工具，通过一些协议（如 WebSocket）与 Node.js 进程通信，从而实现调试功能。
### chrome debug node 用的是 chrome 的v8 而不是 node v8吗?
不是的。当我们说在 Chrome 浏览器中调试 Node.js 应用时，实际上是利用了 Chrome DevTools 这一调试工具来连接到 Node.js 进程。Node.js 应用本身运行的是 Node.js 的 V8 引擎。Node.js 和 Chrome 浏览器都使用了 V8 引擎作为 JavaScript 的执行环境，但是它们各自维护自己的 V8 引擎实例。
简而言之，即使是在 Chrome 浏览器中调试 Node.js 应用，Node.js 应用也是运行在 Node.js 的 V8 引擎上，而不是 Chrome 的 V8 引擎。Chrome DevTools 仅仅作为一个强大的界面工具，通过一些协议（如 WebSocket）与 Node.js 进程通信，从而实现调试功能。

### node 异步操作 16 帧是什么意思？

Node.js中，当提到“16帧来自此异步操作”时，它指的是在执行一个异步操作期间，调用栈中累积的函数调用数量为16。每一“帧”代表了调用栈中的一个函数调用。在异步编程中，一个操作（如文件读取、数据库查询或网络请求等）会在完成时回调函数，这个过程中可能会涉及多个函数的调用。
这里的“帧”是调试和性能分析工具中用来表示执行上下文的一个术语。当你在Node.js应用中遇到性能问题，或者想要理解某个异步操作是如何执行的时候，分析这些“帧”可以帮助你定位问题或理解代码的执行流程。
例如，如果你使用Node.js的async_hooks模块或性能分析工具（如上文提到的clinic）来跟踪异步操作，你可能会看到关于异步操作的帧的信息。这些信息可以帮助你理解异步操作的执行路径，包括哪些函数被调用，以及它们之间的调用关系。
总结来说，“16帧来自此异步操作”意味着在执行该异步操作的过程中，有16个函数调用被执行，这为你提供了一个关于该异步操作执行路径的快照。

### swap 内存是什么？
Swap 内存，也称为交换空间，是一种计算机内存管理的功能。当物理内存（RAM）不足以容纳当前运行的所有程序时，操作系统会将一部分数据从物理内存移动到预先设置的硬盘空间（即 Swap 空间）中。这样可以释放物理内存空间，使得系统可以继续运行更多的程序。但是，由于硬盘的读写速度远低于物理内存，所以使用 Swap 空间会降低系统的性能。
Swap 内存的主要作用包括：
扩展物理内存：Swap 空间可以被视为虚拟内存，它扩展了系统可用的内存容量，允许系统运行更多的程序。
内存管理：Swap 空间可以帮助操作系统更有效地管理内存资源。通过将不常用的数据移动到 Swap 空间，操作系统可以确保物理内存被最需要的数据和程序使用。
防止系统崩溃：在物理内存耗尽时，没有 Swap 空间的系统可能会崩溃或无法运行新的程序。有了 Swap 空间，系统可以避免这种情况，保持稳定运行。
然而，过度依赖 Swap 内存会导致系统性能下降，特别是当系统频繁访问 Swap 空间时。因此，合理配置物理内存和 Swap 空间的大小，以及监控系统的内存使用情况，对于维护系统性能是非常重要的