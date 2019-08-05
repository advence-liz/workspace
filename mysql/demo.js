const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Aa123456',
  database: 'test'
})

connection.connect()

connection.query('SELECT * from runoob_tbl;', function (error, results, fields) {
  if (error) throw error
  console.log('The solution is: ')
  console.table(results)
})

connection.end()
