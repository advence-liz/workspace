# eggjs 


## 单进程启动

https://github.com/eggjs/egg/pull/3430/files#diff-20cb449399750b160a4adfac13aa25ed97c9faacf30bee11ed4a16870f3ff4bf

```js
/**
 * start app with single process mode
 *
 * @param {String} baseDir - base dir.
 * @param {Object} [options] - optional
 * @return {App} app - Application object.
 */
exports.singleProcessApp = async (baseDir, options = {}) => {
  if (!baseDir.startsWith('/')) baseDir = path.join(__dirname, 'fixtures', baseDir);
  options.env = options.env || 'unittest';
  options.baseDir = baseDir;
  const app = await egg.start(options);
  app.httpRequest = () => request(app.callback());
  return app;
};
```