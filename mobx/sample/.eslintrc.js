module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: "babel-eslint",
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    "experimentalDecorators": true,
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-console': 0,
    'no-unused-vars': 1
  }
}
