const sqlExcute = require('../db')
const moment = require('moment')

const getGoodsCategoriesSql = `SELECT id, name FROM goods_cate WHERE p_cate_id IS NULL`
const getGoodsSubCategoriesSql = `SELECT id, name, img
                                  FROM goods_cate
                                  WHERE p_cate_id IS NOT NULL
                                  LIMIT ?, ?;
                                  SELECT COUNT(*) AS count
                                  FROM goods_cate
                                  WHERE p_cate_id IS NOT NULL`
const getGoodsSubCategoriesByIdSql = `SELECT id, name, img
                                      FROM goods_cate
                                      WHERE p_cate_id = ?`

module.exports = {
  getGoodsCategoriesAction(req, res) {
    sqlExcute(getGoodsCategoriesSql)
      .then(result => {
        res.sendSucc('获取商品一级分类列表数据成功!', result)
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  getGoodsSubCategoriesAction(req, res) {
    if (!req.checkFormBody(['page', 'pageSize'], res)) return
    const pageSize = parseInt(req.query.pageSize)
    sqlExcute(getGoodsSubCategoriesSql, [(req.query.page - 1) * pageSize, pageSize])
      .then(result => {
        res.sendSucc('获取商品所有二级分类数据成功!', { cates: result[0], totalCount: result[1][0].count })
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  getGoodsSubCategoriesByIdAction(req, res) {
    const cateId = parseInt(req.params.id)
    sqlExcute(getGoodsSubCategoriesByIdSql, cateId)
      .then(result => {
        res.sendSucc('获取商品分类数据成功!', result)
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  getGoodsListAction(req, res) {
    // if (!req.checkFormBody(['page', 'pageSize'], res)) return

    // // 分页参数
    // const pageSize = parseInt(req.query.pageSize)
    // let queryParams = [(req.query.page - 1) * pageSize, pageSize]
    // let queryParamsResult = []

    // // 分类条件
    // let queryCondition = ``
    // if (req.checkFormBody(['keys'])) {
    //   queryCondition = `WHERE g.name LIKE ?
    //                     OR g.description LIKE ?`
    //   queryParamsResult = ['%' + req.query.keys + '%', '%' + req.query.keys + '%']
    // }

    // // 检测是否有需要分类查询
    // if (req.checkFormBody(['cateId'])) {
    //   queryCondition = `WHERE g.cate_id = ?
    //                     OR g.sub_cate_id = ?`
    //   queryParamsResult = [req.query.cateId, req.query.cateId]
    //   // 拼接6个问号的查询参数
    // }

    // queryParams = queryParamsResult.concat(queryParams).concat(queryParamsResult)

    const getGoodsListSql = `SELECT g.goods_id, g.goods_name, g.goods_price,g.goods_number, g.goods_introduce, pic.pics_big
                        FROM sp_goods g LEFT JOIN sp_goods_pics AS pic ON g.goods_id = pic.goods_id  
                        `

    sqlExcute(getGoodsListSql)
      .then(result => {
        
  
        res.sendSucc('获取商品列表成功!', { goods: result})
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  getGoodsListByType(req, res) {
    // if (!req.checkFormBody(['page', 'pageSize'], res)) return

    // // 分页参数
    const type = parseInt(req.query.type)
    // let queryParams = [(req.query.page - 1) * pageSize, pageSize]
    // let queryParamsResult = []

    // // 分类条件
    // let queryCondition = ``
    // if (req.checkFormBody(['keys'])) {
    //   queryCondition = `WHERE g.name LIKE ?
    //                     OR g.description LIKE ?`
    //   queryParamsResult = ['%' + req.query.keys + '%', '%' + req.query.keys + '%']
    // }

    // // 检测是否有需要分类查询
    // if (req.checkFormBody(['cateId'])) {
    //   queryCondition = `WHERE g.cate_id = ?
    //                     OR g.sub_cate_id = ?`
    //   queryParamsResult = [req.query.cateId, req.query.cateId]
    //   // 拼接6个问号的查询参数
    // }

    // queryParams = queryParamsResult.concat(queryParams).concat(queryParamsResult)

    const getGoodsListSql = `SELECT g.goods_id, g.goods_name, g.goods_price,g.goods_number, g.goods_introduce, pic.pics_big
                        FROM sp_goods g LEFT JOIN sp_goods_pics AS pic ON g.goods_id = pic.goods_id WHERE g.is_del = 0`

    sqlExcute(getGoodsListSql)
      .then(result => {
        
  
        res.sendSucc('获取商品列表成功!', { goods: result})
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  getGoodsInfoAction(req, res) {
    if (!req.checkFormBody(['id'], res)) return

    const getGoodsInfoSql = `SELECT g.goods_id, g.goods_name, g.goods_price,g.goods_number, g.goods_introduce, pic.pics_big
                            FROM sp_goods g LEFT JOIN sp_goods_pics AS pic ON g.goods_id = pic.goods_id
                            WHERE g.goods_id = ?
                            LIMIT 0, 1`

    sqlExcute(getGoodsInfoSql, req.params.id)
      .then(result => {
        let goodsInfo = result[0]
        // sqlExcute(`SELECT COUNT(*) AS count FROM shopping_cart WHERE user_id = ? AND del_state = 0`, req.userInfo.id).then(result=>{
        //   goodsInfo['cart_count'] = result[0].count
        //  goodsInfo.cover_img = JSON.parse(goodsInfo.cover_img)
        // goodsInfo.img = JSON.parse(goodsInfo.img)
        // goodsInfo["guige"] = JSON.parse(goodsInfo["guige"])         
        //   res.sendSucc('获取商品详情成功!', goodsInfo)
        // }).catch(err => {
        //   res.sendErr(400, '获取商品详情失败!请检查id是否正确!')
        // })
        res.sendSucc('获取商品详情成功!', goodsInfo)
      })
      
      .catch(err => {
        res.sendErr(400, '获取商品详情失败!请检查id是否正确!')
      })
  },
  addGoods(req, res){
   
    let attrs = ['name', 'img', 'description', 'discount_info', 'sale_price', 'sale_count',"ctime","kucun","cover_img","guige",'iftuijian']
    
    if (!req.checkFormBody(attrs, res)) return

    let goodsInfo = {}
    attrs.forEach(attr => {
      // if(attr == "img" || attr == "cover_img" || attr == "guige"){
      //   goodsInfo[attr] = JSON.stringify(req.body[attr])
        
      // }
      // else 
      goodsInfo[attr] = req.body[attr]
    })
    goodsInfo['price'] = 0

    const addGoodsSql = `INSERT INTO goods SET ?` 
                            
    sqlExcute(addGoodsSql, goodsInfo)
      .then(result => {
        let goodsInfo = result[0]
        // goodsInfo["cover_img"] = JSON.parse(goodsInfo["cover_img"])
        // goodsInfo["img"] = JSON.parse(goodsInfo["img"])
        // goodsInfo["guige"] = JSON.parse(goodsInfo["guige"])
        res.sendSucc('添加商品成功!', goodsInfo)
      })
      .catch(err => {
        res.sendErr(400, '添加商品失败!请检查传入数据是否正确!')
      })    

  },
  deleteGoods(req, res){
    if (!req.checkFormBody(['id'], res)) return

    const deleteGoodsSql = `DELETE FROM goods WHERE id = ?` 

    sqlExcute(deleteGoodsSql, req.params.id)
      .then(result => {

        res.sendSucc('删除商品成功!')
      })
      .catch(err => {
        res.sendErr(400, '删除商品失败!请检查传入id是否正确!')
      })  
  },

  updateGoods(req, res){
    let attrs = ['name', 'img', 'description', 'discount_info', 'sale_price', 'sale_count',"ctime","kucun","cover_img","guige","iftuijian"]
    
    if (!req.checkFormBody(attrs, res)) return

    let goodsInfo = {}
    attrs.forEach(attr => {
      // if(attr == "img" || attr == "cover_img" || attr == "guige"){
      //   goodsInfo[attr] = JSON.stringify(req.body[attr])
        
      // }
      // else 
      goodsInfo[attr] = req.body[attr]
    })
    goodsInfo['price'] = 0

    const updateGoodsSql = `UPDATE goods SET ? WHERE id = ?` 
                            
    sqlExcute(updateGoodsSql, [goodsInfo, req.params.id])
      .then(result => {
        let goodsInfo = result[0]

        res.sendSucc('修改商品成功!', goodsInfo)
      })
      .catch(err => {
        res.sendErr(400, '修改商品失败!请检查传入数据是否正确!')
      })    

  },  
}
