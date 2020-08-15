module.exports = {
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: 'eslint:recommended',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'no-console': 0,
        'no-unused-vars': 1
    }
}
