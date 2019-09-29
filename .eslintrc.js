module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
    browser: true
  },
  parser: 'babel-eslint',
  extends: ['standard', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react'],
  rules: {
    'no-console': 'off',
    'react/prop-types': 0
    // 'react/jsx-uses-vars': 2
  }
}
