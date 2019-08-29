const mysql = require('mysql')
const config = require('../automation.config')
const logger = require('./logger').sqlLogger

class MysqlManager {
    constructor() {
        this.connection = mysql.createConnection(config.mysql)
        this.connection.connect()
    }

    close() {
        this.connection.end()
    }

    query(query) {
        const connection = this.connection
        return new Promise((resolve, reject) => {
            connection.query(query, function(error, results, fields) {
                if (error) {
                    reject(error)
                }
                logger.debug(query)
                logger.debug(`affected ${results.affectedRows} rows`)
                logger.debug(`changed ${results.changedRows} rows`)
                resolve({ results, fields })
            })
        })
    }
}

module.exports = MysqlManager
