const Sequelize = require('sequelize');
module.exports = new Sequelize('mydb', 'root', 'jxj13140123', {
  host: '49.233.9.86',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // 仅限 SQLite
  // storage: 'path/to/database.sqlite',

  // 请参考 Querying - 查询 操作符 章节
  operatorsAliases: false,
  timezone: '+08:00'
})
