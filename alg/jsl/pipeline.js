// ts-check
var data = ['a', 'b', 'c']

function adda(x) {
    return x + 'a'
}

function addb(x) {
    return x + 'b'
}

function pipeline(fns = [], data) {
    return fns.reduce((x, y) => {
        return x.map(y)
    }, data)
}

const result = pipeline([adda, addb], data)
console.dir(result)
