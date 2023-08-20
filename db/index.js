const mysql = require('mysql');
const conn = mysql.createConnection({
  host: '49.233.9.86',
  user: 'root',
  password: 'jxj13140123',
  database: 'mydb',
  multipleStatements: true
})

module.exports = (sql, data) => {
  return new Promise((resovle, reject) => {
    conn.query(sql, data, (err, result) => {
      if (err) reject(err)
      resovle(result)
    })
  })
}