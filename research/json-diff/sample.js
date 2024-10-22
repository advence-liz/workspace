var jsonDiff = require('json-diff')

console.log(
    jsonDiff.diff(
        { foo: 'bar', bar: 1 },
        { foo: 'baz', bar: 2 },
        { excludeKeys: ['bar'] }
    )
)
