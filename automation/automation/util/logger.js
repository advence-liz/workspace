const path = require('path')
const log4js = require('log4js')

log4js.configure({
    appenders: {
        sql: { type: 'file', filename: path.join(__dirname, '..', 'tmp', 'logs', 'sql.log') },
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ['console'], level: 'trace' },
        sql: { appenders: ['sql'], level: 'trace' }
    }
})

const sqlLogger = log4js.getLogger('sql')
const logger = log4js.getLogger()

module.exports = {
    sqlLogger,
    logger
}
