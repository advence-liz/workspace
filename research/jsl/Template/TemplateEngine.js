/**
 *
 * @param {String} html 模板字符串
 * @param {PlanObject} options 模板对象 optional
 * @return {String|Function} 根据是否传入 options 返回 string or option
 * @desc
 * /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g
 * ^( )?可以是一个空格开头
 */
function TemplateEngine(html, options) {
  var matchType = /<%/g
  var re = matchType.test(html) ? /<%([^%>]+)?%>/g : /{{([^}}]+)?}}/g

  var reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g
  // 前面只能有一个空格或者没有必须严格执行

  var code = 'var r=[];\n'

  var cursor = 0

  var cur_context = TemplateEngine.prefix ? '' : 'this.'
  var add = function(line, js) {
    // 如果js为true 则需要判断line 中是否包含JS reEXP 定义的 条件表达式 如果是则执行，如果是求职表达式 将值添加到 字符串数组 r
    // 近一步或许可以向 lodash 哪有判断 line 开头是 = - @ 之类的对应指定逻辑
    js
      ? (code += line.match(reExp)
          ? line + '\n'
          : 'r.push(' + cur_context + line + ');\n')
      : // line.replace(/"/g,'\\"') line 内部的" 不转义会报错 r.push("<a href=\"#\">");
        (code +=
          line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '')
    return add
  }
  var match
  while ((match = re.exec(html))) {
    // add 返回add 第一个add方法处理match之前的字符必然不包含js（相对于add（line，false）第二个处理match的结果需要判断是否包含js（add（line，true）
    add(html.slice(cursor, match.index))(match[1], true)
    cursor = match.index + match[0].length
  }
  add(html.substr(cursor, html.length - cursor))
  code += 'return r.join("");'
  var fun = new Function(code.replace(/[\r\t\n]/g, ''))
  if (options) {
    return fun.apply(options)
  } else {
    return function(options) {
      return fun.apply(options)
    }
  }
}
// 当设置问false 时求值表达式可以不加this
TemplateEngine.prefix = true
module.exports = TemplateEngine
