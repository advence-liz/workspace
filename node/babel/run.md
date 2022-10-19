@babel/preset-env: `DEBUG` option

Using targets:
{
  "android": "4",
  "ios": "8"
}

Using modules transform: auto

Using plugins:
  proposal-class-static-block { android, ios }
  proposal-private-property-in-object { android, ios < 15 }
  proposal-class-properties { android, ios < 15 }
  proposal-private-methods { android, ios < 15 }
  proposal-numeric-separator { android, ios < 13 }
  proposal-logical-assignment-operators { android, ios < 14 }
  proposal-nullish-coalescing-operator { android, ios < 13.4 }
  proposal-optional-chaining { android, ios < 13.4 }
  proposal-json-strings { android, ios < 12 }
  proposal-optional-catch-binding { android, ios < 11.3 }
  transform-parameters { android, ios }
  proposal-async-generator-functions { android, ios < 12 }
  proposal-object-rest-spread { android, ios < 11.3 }
  transform-dotall-regex { android, ios < 11.3 }
  proposal-unicode-property-regex { android, ios < 11.3 }
  transform-named-capturing-groups-regex { android, ios < 11.3 }
  transform-async-to-generator { android, ios < 11 }
  transform-exponentiation-operator { android, ios < 10.3 }
  transform-template-literals { android, ios < 13 }
  transform-literals { android, ios < 9 }
  transform-function-name { android, ios < 10 }
  transform-arrow-functions { android, ios < 10 }
  transform-block-scoped-functions { android, ios < 10 }
  transform-classes { android, ios < 10 }
  transform-object-super { android, ios < 10 }
  transform-shorthand-properties { android, ios < 9 }
  transform-duplicate-keys { android, ios < 9 }
  transform-computed-properties { android }
  transform-for-of { android, ios < 10 }
  transform-sticky-regex { android, ios < 10 }
  transform-unicode-escapes { android, ios < 9 }
  transform-unicode-regex { android, ios < 12 }
  transform-spread { android, ios < 10 }
  transform-destructuring { android, ios < 10 }
  transform-block-scoping { android, ios < 11 }
  transform-typeof-symbol { android, ios < 9 }
  transform-new-target { android, ios < 10 }
  transform-regenerator { android, ios < 10 }
  transform-reserved-words { android < 4.4 }
  proposal-export-namespace-from { android < 72, ios }
  transform-modules-commonjs
  proposal-dynamic-import
corejs3: `DEBUG` option

Using targets: {
  "android": "4",
  "ios": "8"
}

Using polyfills with `usage-global` method:
regenerator: `DEBUG` option

Using targets: {}

Using polyfills with `usage-global` method:
Based on your code and targets, the corejs3 polyfill did not add any polyfill.
Based on your code and targets, the regenerator polyfill did not add any polyfill.
