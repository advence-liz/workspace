var jsonDiff = require('json-diff')

console.log(
    jsonDiff.diff(
        { srot: 1, foo: 'bar', bar: 1, del: 1222 },
        { foo: 'baz', bar: 2, srot: 1 }
        // { excludeKeys: ['bar'] }
    )
)
