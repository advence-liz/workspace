const log4js = require('log4js')
log4js.configure({
  appenders: {
    sql: { type: 'file', filename: 'sql.log' },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console'], level: 'trace' },
    sql: { appenders: ['sql'], level: 'trace' }
  }
})

const logger = log4js.getLogger('sql')
const debug = log4js.getLogger()
debug.info('debug')
logger.trace('Entering cheese testing')
logger.debug('Got cheese.')
logger.info('Cheese is Comté.')
logger.warn('Cheese is quite smelly.')
logger.error('Cheese is too ripe!')
logger.fatal('Cheese was breeding ground for listeria.')
