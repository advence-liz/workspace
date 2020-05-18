# eslint+husky+prettier+lint-staged 配置方案

道路千万条简单第一条,本文无深入浅出的道理讲解，只有目前我发现最简单易行的解决方案。

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
    ],
    // "*.{scss,less,css}": [
    //   "prettier --write",
    // ],
    // "*.{json,md}": [
    //   "prettier --write",
    // ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
```

## 调整 eslint & prettier 配置

调整 eslint & prettier 中的风格配置防止相互冲突，你也可以选择使用[eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)才完成此事，但是个人感觉大可不必，
当你对 eslint & prettier 有一定熟练度之后你会发现你需要调整的基本就是下面四个规则，只要将下面的四个规则安排的整整齐齐基本就大功告成了。

```json
// prettier
{
    "trailingComma": "none",
    "tabWidth": 4,
    "semi": false,
    "singleQuote": true
}
```

```js
// eslint
module.exports = {
  rules: {
    "comma-dangle": ['error', 'never'],
    indent: ['error', 2],
    semi: ['error', 'never'],
    quotes: ['error', 'single']

}

```

prettier-eslint --write index.js === prettier --write index.js eslint --fix index.js

## 发现

vscode 使用 prettier 格式化，自动 fix 冲突的 eslint 规则

因为单独执行命令 prettier 的格式结果跟 vscode 不符合
npx prettier --write index.js
npx prettier-eslint --write index.js
npx eslint --fix index.js
