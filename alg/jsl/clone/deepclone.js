/**
 *
 * @param {object} source
 * typeof [] 也等于 'object'
 * [for of for in Object.keys ](https://juejin.im/post/5b2617e5f265da5954425022)
 */
function deepClone(source) {
  if (typeof source !== 'object') return source
  let target = source.constructor === Array ? [] : {}

  for (let key in source) {
    target[key] = deepClone(source[key])
  }
  return target
}

let source = {
  liz: { name: 'liz', age: 10 },
  tom: { name: 'name', age: 11 },
  arr: [1, 2, 3]
}

let target = deepClone(source)
console.log(target)
