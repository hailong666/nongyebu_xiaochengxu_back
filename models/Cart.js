const Sequelize = require('sequelize')
const { DataTypes } = require("sequelize")
const sequelize = require('../db/db')
const sqlExcute = require('../db')
const Cart = sequelize.define('shopping_cart', {

  img : DataTypes.STRING,
  name : DataTypes.STRING,
  sale_price : DataTypes.FLOAT,
  has_select : DataTypes.BOOLEAN ,
  goods_id: Sequelize.INTEGER,
  user_id: Sequelize.INTEGER,
  count: Sequelize.INTEGER,
  guige:DataTypes.STRING,
  del_state: Sequelize.TINYINT
}, {
    timestamps: true,
    createdAt: false,
    updatedAt: 'utime',
    freezeTableName: true,
  })

Cart.addGoods = async function (goodsInfo, callback) {

  let { goods_id, user_id, count ,guige} = goodsInfo

  let result = await sqlExcute(`SELECT COUNT(*) AS count, name, img, sale_price, size  FROM goods WHERE id = ${goods_id}`)
  if (result[0].count == 0) return callback(null, new Error('商品不存在!'))

  goodsInfo.img = result[0].img
  goodsInfo.name = result[0].name
  goodsInfo.sale_price = result[0].sale_price
  goodsInfo.has_select = true
  goodsInfo.del_state = 0
  goodsInfo.guige = guige
  Cart.findOrCreate({
    where: {
      goods_id,
      user_id
    },
    defaults: goodsInfo
  })
    .spread((result, created) => {
      if (created) return callback(created)
      let cartInfo = result.dataValues
      cartInfo.count = count
      cartInfo.del_state = 0
      cartInfo.guige = guige
      return Cart.update(cartInfo, {
        where: {
          id: cartInfo.id
        }
      })
    })
    .then(result => {
      callback(true)
    })
    .catch(err => {
      callback(null, err)
    })
}

Cart.deleteGoods = async function (goodsInfo, callback) {
  let { goods_id, user_id } = goodsInfo

  let result = await sqlExcute(`SELECT COUNT(*) AS count FROM goods WHERE id = ${goods_id}`)
  if (result[0].count == 0) return callback(null, new Error('商品不存在!'))

  Cart.update({
    del_state: 1,
    count: 0
  }, {
      where: {
        goods_id,
        user_id
      }
    })
    .then(result => {
      callback(true)
    })
    .catch(err => {
      callback(null, err)
    })
}

Cart.getGoods = function (data, callback) {
  let { user_id, page, pageSize } = data
  const getGoodsSql = `SELECT g.id, g.name, g.discount_info,g.img, g.price, g.sale_price, g.sale_count, g.ctime, sc.count, sc.guige
                      FROM shopping_cart AS sc
                      LEFT JOIN goods AS g
                      ON sc.goods_id = g.id
                      WHERE sc.user_id = ${user_id}
                      AND sc.del_state = 0
                      GROUP BY g.id
                      ORDER BY g.id DESC
                      LIMIT ${(page - 1) * pageSize}, ${pageSize}`
  sequelize.query(getGoodsSql)
    .then(result => {
      callback(result[0])
    })
    .catch(err => {
      callback(null, err)
    })
}

module.exports = Cart