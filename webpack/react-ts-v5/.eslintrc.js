//https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: [
    'react-hooks', // https://www.npmjs.com/package/eslint-plugin-react-hooks#installation
  ],
  noInlineConfig: true,
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    eqeqeq: ['error', 'always'],
    'comma-dangle': 0,
    'prefer-template': 'error',
    'react/jsx-indent-props': 0,
    'no-console': 'error',
    'import/no-unresolved': 'off',
    'no-useless-escape': 'error',
    'object-curly-spacing': ['error', 'always'],
    'space-before-function-paren': 0,
    'arrow-parens': 'error',
    'consistent-return': 'error',
    'react/jsx-props-no-spreading': 0,
    'no-restricted-syntax': 'off',
    'implicit-arrow-linebreak': ['error'],
    'no-unused-expressions': ['error'],
    'no-constructor-return': 'warn',
    'object-curly-newline': 0,
    'arrow-body-style': ['error'],
    'no-multiple-empty-lines': 'error',
    'no-empty-function': [
      'error',
      {
        allow: [],
      },
    ],
    'no-prototype-builtins': 'warn',
    'no-mixed-operators': 'error', // 临时新增，默认为error。代码中有被行间注释禁用代码。
    'array-callback-return': 'error', // 临时新增，默认为error。代码中有被行间注释禁用代码
    'no-control-regex': 'error', // 临时新增，默认为error。代码中有被行间注释禁用代码
    'no-redeclare': 'error', // 临时新增，默认为error。
    'prefer-destructuring': ['warn'],
    'id-length': [
      'warn',
      {
        min: 2,

        // 用于lodash，请勿乱用。
        exceptions: ['_'],

        // 忽略属性名称字符长度约定，如MTD的Table组件的scroll.x和scroll.y。
        // 请勿乱用。
        properties: 'never',
      },
    ],
    // React规则补充
    'react/jsx-pascal-case': [
      'error',
      {
        allowAllCaps: false,
        allowLeadingUnderscore: false,
      },
    ],
    'react/jsx-key': 'warn',
    'react/require-default-props': [
      'warn',
      {
        functions: 'defaultArguments',
      },
    ],
    'react/no-unused-prop-types': [
      'warn',
      {
        ignore: [
          // 编写FormItem组件，必须定义toFormItem，但组件中不会使用。
          'toFormItem',
        ],
      },
    ],
    'react/jsx-no-useless-fragment': 'error',
    'react/no-array-index-key': 'error',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // React类组件规则。不使用类组件的忽略。均默认为error。临时设置warn以使代码可提交。
    'react/no-unused-class-component-methods': 'error',
    'react/default-props-match-prop-types': 'error',
    'react/no-unstable-nested-components': 'error',

    // TypeScript规则补充
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/no-invalid-void-type': 'error',
    '@typescript-eslint/no-extraneous-class': 'error', // 临时新增，默认为error。代码中有被行间注释禁用代码。
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/default-param-last': ['warn'],

    // 借鉴TypeScript，详见：https://github.com/microsoft/TypeScript/blob/main/.eslintrc.json。
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'typeLike',
        format: ['PascalCase'],
        filter: { regex: '^(__String|[A-Za-z]+_[A-Za-z]+)$', match: false },
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false },
        filter: { regex: '^I(Arguments|TextWriter|O([A-Z][a-z]+[A-Za-z]*)?)$', match: false },
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        filter: { regex: '^(_{1,2}filename|_{1,2}dirname|_+|[A-Za-z]+_[A-Za-z]+)$', match: false },
      },
      {
        selector: 'function',
        format: ['camelCase'],
        filter: { regex: '^[A-Za-z]+_[A-Za-z]+$', match: false },
      },
      {
        selector: 'parameter',
        format: ['camelCase', 'PascalCase'],
        leadingUnderscore: 'allow',
        filter: { regex: '^(_+|[A-Za-z]+_[A-Z][a-z]+)$', match: false },
      },
      {
        selector: 'method',
        format: ['camelCase'],
        filter: { regex: '^([0-9]+|[A-Za-z]+_[A-Za-z]+)$', match: false },
      },
      {
        selector: 'memberLike',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        filter: { regex: '^([0-9]+|[A-Za-z]+_[A-Za-z]+)$', match: false },
      },
      {
        selector: 'enumMember',
        format: ['PascalCase'],
        filter: { regex: '^[A-Za-z]+_[A-Za-z]+$', match: false },
      },
      {
        selector: 'property',
        format: null,
      },
    ],

    // 其它可自动修复的临时配置，自动修复后删除
    'space-infix-ops': ['error'],
    '@typescript-eslint/type-annotation-spacing': ['error'],
    // 'function-paren-newline': ['error'],
    'react/self-closing-comp': ['error'],
    'react/jsx-props-no-multi-spaces': ['error'],
    'implicit-arrow-linebreak': 0,
  },
}
