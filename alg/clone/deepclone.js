/**
 *
 * @param {object} source
 * typeof [] 也等于 'object'
 */
function deepClone (source) {
  let target = {}
  if (typeof source !== 'object') return
  if (source.constructor === Array) target = []

  for (let key in source) {
    if (typeof key !== 'object') {
      target[key] = source[key]
    } else {
      target[key] = deepClone(source[key])
    }
  }
  return target
}

let source = { liz: { name: 'liz', age: 10 } }

let target = deepClone(source)
