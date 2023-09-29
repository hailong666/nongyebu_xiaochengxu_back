const mysql = require('mysql');
const conn = mysql.createConnection({
  host: '82.156.2.244',
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
