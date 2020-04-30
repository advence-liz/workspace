const mysql = require('mysql')
const { promisify } = require('util')
const connection = mysql.createConnection({
  host: 'rds-test-o-m.mysql.rds.aliyuncs.com',
  user: 'test_admin',
  password: 'DB$PU*T4n74UdmfE'
  // database: 'test_qu'
})

const query = query => {
  connection.connect()
  return new Promise((resolve, reject) => {
    connection.query(query, function (error, results, fields) {
      connection.end()
      if (error) reject(error)
      resolve({ results, fields })
    })
  })
}

query(
  "select code from test_qu.sms_logs where mobile='18504411849' order by id desc limit 1"
)
  .then(({ results, fields }) => {
    console.table(results)
  })
  .catch(err => {
    console.error('ERROE:', err)
  })
