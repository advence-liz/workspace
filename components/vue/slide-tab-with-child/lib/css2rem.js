/**
 * 工具函数将数值自动转为rem
 * @param {object} styleObject
 * @example
 * css2rem({"top":0,"left":0,right:"-111"})
 * >>
 * {top: "0rem", left: "0rem", right: "-1.11rem"}
 */
const range = new Set(['zIndex', 'z-index'])

const css2rem = styleObject => {
  for (let key in styleObject) {
    let val = styleObject[key]
    if (
      styleObject.hasOwnProperty(key) &&
      !range.has(key) &&
      val.constructor === Number
    ) {
      styleObject[key] = `${val / 100}rem`
    }
  }
  return styleObject
}

export default css2rem
