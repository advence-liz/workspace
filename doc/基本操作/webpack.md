## webpacck 输出 esm

设置  module 对应输出 esm ，webpack 5 之前不支持 esm

output.library.type
配置将库暴露的方式。

类型：string

类型默认包括 'var'、 'module'、 'assign'、 'assign-properties'、 'this'、 'window'、 'self'、 'global'、 'commonjs'、 'commonjs2'、 'commonjs-module'、 'commonjs-static'、 'amd'、 'amd-require'、 'umd'、 'umd2'、 'jsonp' 以及 'system'，除此之外也可以通过插件添加。

```js
如果你将 entry 设置为一个 object，所以入口都可以通过 library 的 array 语法暴露：

module.exports = {
  // …
  entry: {
    a: './src/a.js',
    b: './src/b.js',
  },
  output: {
    filename: '[name].js',
    library: ['MyLibrary', '[name]'], // name is a placeholder here
  },
};
假设 a.js 与 b.js 导出名为 hello 的函数，这就是如何使用这些库的方法：

<script src="https://example.org/path/to/a.js"></script>
<script src="https://example.org/path/to/b.js"></script>
<script>
  MyLibrary.a.hello('webpack');
  MyLibrary.b.hello('webpack');
</script>
查看 示例 获取更多内容。

请注意，如果你打算在每个入口点配置 library 配置项的话，以上配置将不能按照预期执行。这里是如何 在每个入口点下 做的方法：

module.exports = {
  // …
  entry: {
    main: {
      import: './src/index.js',
      library: {
        // `output.library` 下的所有配置项可以在这里使用
        name: 'MyLibrary',
        type: 'umd',
        umdNamedDefine: true,
      },
    },
    another: {
      import: './src/another.js',
      library: {
        name: 'AnotherLibrary',
        type: 'commonjs2',
      },
    },
  },
};
```