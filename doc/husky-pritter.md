# eslint+husky+prettier+lint-staged 配置方案

道路千万条简单第一条

## 安装依赖

-   [husky](https://github.com/typicode/husky#readme) Git hooks made easy 🐶 woof!
-   [lint-staged](https://github.com/okonet/lint-staged)🚫💩 — Run linters on git staged files
-   [prettier-eslint-cli](https://github.com/prettier/prettier-eslint)Code ➡️ prettier ➡️ eslint --fix ➡️ Formatted Code ✨

```base
$ yarn add husky lint-staged prettier-eslint-cli
```

## 配置 husky & lint-staged

在 package.json 添加如下配置

```json
"lint-staged": {
    "*.js": [
      "prettier-eslint --write",
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
```
prettier-eslint --write index.js === prettier --write index.js eslint --fix index.js

## 发现
vscode 使用 prettier 格式化，自动 fix 冲突的 eslint 规则

因为单独执行命令 prettier 的格式结果跟 vscode 不符合
npx prettier --write index.js
npx prettier-eslint --write index.js
npx eslint --fix index.js           