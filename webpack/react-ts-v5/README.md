# 项目介绍

## 项目启动

## 开发规范

### 目录结构
├── README.md
├── src
│   ├── components // 公共组件目录
│   │   ├── error
│   │   └── loading
│   ├── config // 配置目录
│   │   └── config.js
│   ├── index.tsx
│   ├── models // 公共业务模块
│   │   └── luckydraw.js
│   ├── pages  // 页面存储目录
│   │   ├── home // 具体页面包含当前页面 store UI
│   │   └── not-found
│   ├── routes // 路由配置目录
│   │   └── index.tsx
│   ├── services // 请求相关目录
│   │   ├── api.js
│   │   └── request.js
│   ├── stores // 公共通用 store
│   ├── style.scss
│   └── utils // 工具函数目录
│       ├── auth
│       ├── index.js
│       └── storage.js
├── tsconfig.json
├── webpack // webpack 配置目录
│   ├── html
│   │   ├── index.dev.ejs
│   │   └── index.ejs
│   ├── lib
│   │   ├── getPort.js
│   │   └── run.js
│   ├── plugins
│   │   ├── cube-game-plugin.js
│   │   └── cube-prerender-plugin.js
│   ├── run
│   │   ├── build.dev.js
│   │   └── build.prod.js
│   ├── webpack.base.config.js
│   ├── webpack.dev.config.js
│   └── webpack.prod.config.js
└── yarn.lock

## 技术选型要求

技术选型为 react hooks + mobox + ts 开发前需要了解以下知识点

### 常用hooks
- useState()
- useEffect()
- useCallback()
- useMemo()
- useRef()
- useContext()
- useReducer()
推荐文章
- https://juejin.cn/post/6844903985338400782#heading-26

### mobox-react
来自 mobx-react 或 mobx-react-lite 包。
### observer
用法：observer(component)
一个高阶组件，可用来在 observable 发生改变时将一个 React 函数组件或类组件重新渲染。
### Observer
用法：<Observer>{() => rendering}</Observer>

渲染所提供的 render 函数，并在 render 函数所使用的 observable 之一发生改变时自动将函数重新渲染。

### useLocalObservable or useLocalStore
原来名字为useLocalStore 版本更新后名字改为 useLocalObservable
用法：useLocalObservable(() => source, annotations?)
使用 makeObservable 创建一个新的 observable，并在组件的整个生命周期内将其保留在组件中。

### 集成 react 
https://zh.mobx.js.org/react-integration.html

### 样式规范

采用BEM思想样式设计，具体书写样式时可以简化。 `blockElementModify`
### 异步调用
异步调用采用 async await
## store 规范
- Mobox 作用 1.状态管理替换 state 2.双向绑定简化逻辑
- store 内容包含 数据 和 逻辑 UI
- 执行原则 全面采用 store
- 全局维度 store 状态在页面之间传递
- 页面维度 store 状态在页面中的组件之间传递
- 组件维度 store 状态只在组件中起效，用于取代 state
- 业务组件 可以直接获取操作  pageStore globalStore
- 复用组件 只可以操作 globalStore （globalStore 为单例）

参考：https://developer.aliyun.com/article/782377?utm_content=g_1000249055

### 参考项目

- 当前项目 pages/demo 目录（持续补充）
- https://github.com/now1then/react-web-pro
- https://github.com/gothinkster/react-mobx-realworld-example-app
- https://developer.aliyun.com/article/782377?utm_content=g_1000249055 (这可能是大型复杂项目下数据流的最佳实践)

#### 样式配置说明
1. 默认对src下的样式文件开启css module。隔离样式正常写，全局样式放在src/global.css 或 src/global.scss下，具体配置见webpack.base.config配置
2. className命名，css module下推荐使用camelCase
3. vscode下智能提示，配置指引https://blog.csdn.net/bidang3275/article/details/119571270
4. 写法示例见pages/demo/demo.tsx


