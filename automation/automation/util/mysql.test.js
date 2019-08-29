const SqlManager = require('./mysql')
const { logger } = require('./logger')

async function run() {
    const sql = new SqlManager()
    await sql.query('select * from runoob_tbl where runoob_id=3 ')
    await sql.query('delete from runoob_tbl where runoob_id = 1')
    await sql.query('INSERT INTO runoob_tbl (runoob_title, runoob_author, submission_date) VALUES ("学习 MySQL", "菜鸟教程", NOW())')
    await sql.query('update `runoob_tbl` set runoob_title= "liz"  where runoob_id=3')
    sql.close()
}

run()
