const mysql = require('think-model-mysql');

module.exports = {
  handle: mysql,
  database: 'nideshop',
  prefix: 'nideshop_',
  encoding: 'utf8mb4',
  host: '49.233.9.86',
  port: '3306',
  user: 'root',
  password: 'jxj13140123',
  dateStrings: true
};
//# sourceMappingURL=database.js.map