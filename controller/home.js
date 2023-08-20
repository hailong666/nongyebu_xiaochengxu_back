const sqlExcute = require('../db')
const moment = require('moment')


module.exports = {
  getBanners(req, res) {
    sqlExcute('SELECT id, img, ctime FROM banner WHERE del_state = 1 LIMIT 0, 5')
      .then(result => {
        res.sendSucc('获取封面轮播图列表成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })
  },
  getRecommendWine(req, res) {
    const getGoodsListSql = `SELECT g.id, g.name, g.cover_img, g.description, g.img, g.iftuijian, g.discount_info, g.price, g.sale_price, g.sale_count, g.ctime
                        FROM goods AS g WHERE iftuijian = 1`
 
    sqlExcute(getGoodsListSql)
      .then(result => {
        res.sendSucc('获取酒类推荐列表成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })
  },
  getPicture(req, res) {
    sqlExcute('SELECT id, img, ctime,  del_state FROM banner')
      .then(result => {
        res.sendSucc('获取图片列表成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })
  },  
  deletePicture(req, res) {
    if (!req.checkFormBody(['id'], res)) return
    pircureid = req.params.id

    sqlExcute('DELETE FROM banner WHERE id = ?',pircureid)
      .then(result => {
        res.sendSucc('删除图片成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })
  },   
  addPicture(req, res) {

    let attrs = ['del_state', 'img']
    
    if (!req.checkFormBody(attrs, res)) return    
    // if (!req.checkFormBody(['id'], res)) return
    let pircute = {}
    attrs.forEach(attr => {
      pircute[attr] = req.body[attr]
    })    
    pircute['ctime'] =  moment().format('YYYY-MM-DD HH:mm:ss')

    sqlExcute('INSERT INTO banner SET ?',pircute)  
      .then(result => {
        res.sendSucc('添加图片成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })
  }
}