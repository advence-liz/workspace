# babel

## babel-cli
- https://luo3.org.cn/posts/learn/develop-and-distributing-js-library-using-rollup-and-babel/

不设置 -x 默认不识别 ts  
```bash
babel src -d lib -x '.ts,.js,.jsx,.tsx'
```
包含样式会被解析成 , scopeId 无所谓，新的webpack 构建流程并不会以query 的 scopeid 为准 ,构建 hashKey relativepath
```js  
require('./styles.scss?scopeId=38682f47'),
```

所以打包正常把 ts js 打包   scss copy 过去就行，引入当前包的模块自行打包样式文件