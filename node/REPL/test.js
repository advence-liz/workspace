var repl = require('repl')

// 创建一个 REPL
var r = repl.start('glob test > ')
// context 即为 REPL 中的上下文环境
var c = r.context
c.glob = require('glob')
