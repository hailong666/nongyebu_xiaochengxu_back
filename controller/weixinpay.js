const sqlExcute = require('../db')
const moment = require('moment')
const WeiXinPay = require('weixinpay');
const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const config = require('../config');
const { name } = require('../models/Cart');
// const { JSON } = require('sequelize');

function setTimeDateFmt(s) {  // 个位数补齐十位数
    return s < 10 ? '0' + s : s;
}

function createordernum() {
    const now = new Date()
    let month = now.getMonth() + 1
    let day = now.getDate()
    let hour = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()
    month = setTimeDateFmt(month)
    day = setTimeDateFmt(day)
    hour = setTimeDateFmt(hour)
    minutes = setTimeDateFmt(minutes)
    seconds = setTimeDateFmt(seconds)
    let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000)).toString();
    return orderCode;
    //基于年月日时分秒+随机数生成订单编号
}
// const pay = new WxPay({
//     appid: config.weixin.appid, // 微信小程序appid
//     mchid: config.weixin.mch_id, // 商户帐号ID
//     publicKey: fs.readFileSync('/home/ubuntu/apiclient_cert.pem'), // 公钥
//     privateKey: fs.readFileSync('/home/ubuntu/apiclient_key.pem'), // 秘钥
//   });
async function createUnifiedOrder(payInfo) {

      // const result = await pay.transactions_jsapi(payInfo);
      // return result



    // const weixinpay = new WeiXinPay({
    //     appid: config.weixin.appid, // 微信小程序appid
    //     openid: payInfo.openid, // 用户openid
    //     mch_id: config.weixin.mch_id, // 商户帐号ID
    //     partner_key: config.weixin.partner_key // 秘钥
    // });
    // return new Promise((resolve, reject) => {
    //   weixinpay.createUnifiedOrder({
    //     body: payInfo.body,
    //     out_trade_no: payInfo.out_trade_no,
    //     total_fee: payInfo.total_fee,
    //     spbill_create_ip: payInfo.spbill_create_ip,
    //     notify_url: config.weixin.notify_url,
    //     trade_type: 'JSAPI'
    //   }, (res) => {
    //     if (res.return_code === 'SUCCESS' && res.result_code === 'SUCCESS') {
    //       const returnParams = {
    //         'appid': res.appid,
    //         'timeStamp': parseInt(Date.now() / 1000) + '',
    //         'nonceStr': res.nonce_str,
    //         'package': 'prepay_id=' + res.prepay_id,
    //         'signType': 'MD5'
    //       };
    //       const paramStr = `appId=${returnParams.appid}&nonceStr=${returnParams.nonceStr}&package=${returnParams.package}&signType=${returnParams.signType}&timeStamp=${returnParams.timeStamp}&key=` + config.weixin.partner_key;
    //       returnParams.paySign = md5(paramStr).toUpperCase();
    //       resolve(returnParams);
    //     } else {
    //       reject(res);
    //     }
    //   });
    // });
}


module.exports = {
  async  payAction(req, res){

    if (!req.checkFormBody(['out_trade_no','total_price','openid'], res)) return
    // sqlExcute('SELECT * FROM orders WHERE order_id = ?', req.body['out_trade_no']).then(result=>{
    //   if(result[0].status == 0){
    //     payInfo = { 
    //       description: req.body['description'],
    //       out_trade_no: result[0].order_id,
    //       amount: {
    //           total: result[0].total_price * 100, // 支付金额，单位为分
    //       },
    //       scene_info: {
    //           payer_client_ip: "123.12.12.123", // 支付者ip，这个不用理会也没有问题
    //       }  ,          
    //       notify_url: 'https://erxiaomen.top:9999/v1/weixinpay/payNotify',
    //       payer: {
    //           openid: req.body['openid'], // 微信小程序用户的openid，一般需要前端发送过来
    //       }
    //      }  
    //     result =  createUnifiedOrder(payInfo)
    //     if(result.status == 200)
    //         res.sendSucc("成功！",result)
    //     else
    //         res.sendErr(400,result)
    //   }else if(result[0].status == 1){
    //     res.sendErr(500,'订单已支付，无需重复支付！')
    //   }
      
    // }).catch(err=>{
    //   res.sendErr(500, err.message)
    // })
        payInfo = { 
            description: '微信支付',
            out_trade_no: req.body['out_trade_no'],
            amount: {
                total: req.body['total_price']*100, // 支付金额，单位为分
            },
            scene_info: {
                payer_client_ip: "123.12.12.123", // 支付者ip，这个不用理会也没有问题
            }  ,          
            notify_url: 'https://erxiaomen.top/v1/weixinpay/payNotify/',
            payer: {
                openid: req.body['openid'], // 微信小程序用户的openid，一般需要前端发送过来
            }
        }         



        // payInfo = { 
        //     body: '支付测试ddddddddddddddd',
        //     out_trade_no: "1234567890dwadwadwadwa",
        //     total_fee: 100,
        //     spbill_create_ip: "123.12.12.123",
        //     notify_url: 'https://erxiaomen.top/',
        //     trade_type: 'JSAPI',
        //     product_id: '1234567890',
        //     openid : 'oF7Ek46s2mAxIUhWdPNWXRfTaJDc'
        // }
        result = await createUnifiedOrder(payInfo)
        if(result.status == 200)
            res.sendSucc("成功！",result)
        else
            res.sendErr(400,result)

    },

    CreateOrder(req, res){
        
        let info = req.body['info']
        let item = req.body['item']
        let total = req.body['total']

        let create_time = moment().format('YYYY-MM-DD HH:mm:ss')
        let expire_time = moment().add(15,"minutes").format('YYYY-MM-DD HH:mm:ss')
        let order_id = createordernum()

        
        const createOrderIdSql = `INSERT INTO orders  SET ?`
        let order = {}
        order['create_time'] = create_time
        order['expire_time'] = expire_time
        order['order_id'] = order_id

        order['item'] = JSON.stringify(item)

        order['total'] = total
        
        order['receiverName'] = info.receiverName
        order['receiverPosition'] = info.receiverPosition
        order['foreignOrganization'] = info.foreignOrganization
        order['giftName'] = info.giftName
        order['giftPosition'] = info.giftPosition
        order['remark'] = info.remark
        order['isok'] = 0

        sqlExcute(createOrderIdSql, order)
        .then(result=>{

          res.sendSucc('添加商品成功!', order)
          
        }).catch(err=>{
          res.sendErr(500, err.message)
        })
  
        return
    },
    payNotify(req, res) {
    // 申请的APIv3
    
    let key = 'beijingzaiwujiyeyouxiangong12345';
    let { ciphertext, associated_data, nonce } = req.body.resource;
    // 解密回调信息
    const result = pay.decipher_gcm(ciphertext, associated_data, nonce, key);
    // 拿到订单号
    let { out_trade_no } = result;
    if (result.trade_state == 'SUCCESS') {
        // 支付成功之后需要进行的业务逻辑
		update_the_order = `UPDATE orders SET status = 1 WHERE order_id = ? AND status = 0`
        sqlExcute(update_the_order, out_trade_no).then(result=>{
          res.send( {"code": "SUCCESS","message": "成功"})
          }).catch(err=>{
            res.sendErr(500, err.message)
          })

        console.log("支付成功！")
    }else if(result.trade_state == 'NOTPAY'){
        update_the_order = `UPDATE orders SET status = 2 WHERE order_id = ?`
        sqlExcute(update_the_order, out_trade_no).then(result=>{
            res.sendSucc('未支付商品!', order)
          }).catch(err=>{
            res.sendErr(500, err.message)
          })

        console.log("未支付商品!")      
    }else if(result.refund_status == 'SUCCESS'){
      refund_time =  moment().format('YYYY-MM-DD HH:mm:ss')
      update_the_order = `UPDATE orders SET status = 2, refund_time = ? WHERE order_id = ? AND status = 1`
      sqlExcute(update_the_order, [refund_time, out_trade_no]).then(result=>{
        res.send( {"code": "SUCCESS","message": "成功"})
        }).catch(err=>{
          res.sendErr(500, err.message)
        })

      console.log("退款成功！")      
    }
    
        // const notifyObj = {};
        // let sign = '';
        // for (const key of Object.keys(notifyData)) {
        //   if (key !== 'sign') {
        //     notifyObj[key] = notifyData[key][0];
        //   } else {
        //     sign = notifyData[key][0];
        //   }
        // }
        // if (notifyObj.return_code !== 'SUCCESS' || notifyObj.result_code !== 'SUCCESS') {
        //   return false;
        // }
        // const signString = this.signQuery(notifyObj);

        // return notifyObj;
    },
    async orderFindall(req, res){
      // if (!req.checkFormBody(['page', 'pageSize'], res)) return
      // page = req.query.page
      // pageSize = req.query.pageSize
      // let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders `)
        sqlExcute(`SELECT * FROM orders  WHERE isok <> 1 ORDER BY create_time DESC`)
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
    },
    async orderShenling(req, res){
      
        sqlExcute(`SELECT * FROM orders WHERE isok = 1 ORDER BY create_time DESC`)
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
    },
    async orderShenBao(req, res){
    
        sqlExcute(`SELECT * FROM orders ORDER BY create_time`)
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
    },
    async updateGood(req, res){
      if (!req.checkFormBody(['name','number', 'price'], res)) return
      let id = parseInt(req.params.id)
      let name = req.query.name
      let number = parseInt(req.query.number)
      let price = parseFloat(req.query.price)
      // pageSize = req.query.pageSize
      // let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders `)
        sqlExcute(`UPDATE sp_goods SET goods_name = ?, goods_price = ?, goods_number = ? WHERE goods_id = ?`,[name, price, number, id])
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('更新礼品成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
    },
    async okOrder(req, res){
      if (!req.checkFormBody(['id'], res)) return
      let id = parseInt(req.params.id)
      let items = await sqlExcute(`SELECT item FROM orders WHERE id = ?`, id)
      // console.log(items[0].item)
      itemjson = JSON.parse(items[0].item)
      // console.log(itemjson)
      for(let item in itemjson){
        // console.log(itemjson[item])
        let good_id = itemjson[item].id
        let count = itemjson[item].quantity
        // console.log(good_id + "  ---  " + count)
        await sqlExcute(`UPDATE sp_goods SET sp_goods.goods_number = sp_goods.goods_number - ? WHERE sp_goods.goods_number > 0 AND goods_id = ?`, [count, good_id])
      }
      // pageSize = req.query.pageSize
      // let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders `)
        sqlExcute(`UPDATE orders SET isok = 1 WHERE id = ?`, id)
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('审批并更新礼品仓库成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
    },
    async orderFindadmin(req, res){
      
      if (!req.checkFormBody(['status','page', 'pageSize','ifsend'], res)) return
      const page = parseInt(req.query.page)
      const pageSize = parseInt(req.query.pageSize)   
      const status = parseInt(req.query.status)
      const ifsend = parseInt(req.query.ifsend)    
      if(isNaN(status)  && isNaN(ifsend) ){
        let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders`)

        sqlExcute('SELECT * FROM orders ORDER BY create_time desc LIMIT ? ,?', [ (page - 1) * pageSize, pageSize])
        .then(result => {
          result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
      }else{
        let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders WHERE status = ? AND ifsend = ?`,[status, ifsend])

        sqlExcute('SELECT * FROM orders WHERE  status = ? AND ifsend = ? ORDER BY create_time desc LIMIT ? ,?', [status, ifsend, (page - 1) * pageSize, pageSize])
        .then(result => {
          result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
      }

    },
    async orderFindById(req, res){
      
      // if (!req.checkFormBody(['status','page', 'pageSize','ifsend'], res)) return
      // const page = parseInt(req.query.page)
      // const pageSize = parseInt(req.query.pageSize)   
      const type = parseInt(req.query.type)
      // const ifsend = parseInt(req.query.ifsend)    
      if(isNaN(type)){
        // let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders WHERE user_id  = ${req.userInfo.id}`)

        sqlExcute('SELECT * FROM orders WHERE type = ? ORDER BY create_time', [type])
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
      }else{
        // let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders WHERE user_id  = ? AND status = ? AND ifsend = ?`,[req.userInfo.id,status, ifsend])

        sqlExcute('SELECT * FROM orders ORDER BY create_time desc')
        .then(result => {
          // result = {result,'orderSize':Countresult[0].count}
          res.sendSucc('查询订单成功!', result)
        })
        .catch(e => {
          res.sendErr(500, e.message)
        })
      }


    },
    async orderFinddetail(req, res){
      if (!req.checkFormBody(['id'], res)) return
      const order_id = parseInt(req.params.id)

      sqlExcute('SELECT * FROM orders WHERE order_id = ? ', order_id)
      .then(result => {
        // result = {result,'orderSize':Countresult[0].count}
        res.sendSucc('查询订单成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })

    },
    cancelorder(req, res){
      if (!req.checkFormBody(['id'], res)) return
      order_id = req.params.id

      sqlExcute('UPDATE orders SET status = 3 WHERE order_id = ?', order_id)
      .then(result => {
        res.sendSucc('取消订单成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })     
    },
   async orderSeach(req, res){
      if (!req.checkFormBody(['name','page', 'pageSize'], res)) return
      goodname = req.query.name
      goodname = 'name":"' + req.query.name
      const page = parseInt(req.query.page)
      const pageSize = parseInt(req.query.pageSize)  
      let Countresult = await sqlExcute(`SELECT COUNT(*) AS count FROM orders where goods_buy REGEXP ? AND user_id = ?`,[goodname, req.userInfo.id])

      sqlExcute('select * from orders where goods_buy REGEXP ? AND user_id = ? ORDER BY create_time LIMIT ? ,?;', [goodname, req.userInfo.id, (page - 1) * pageSize, pageSize])
      .then(result => {
        result = {result,'orderSize':Countresult[0].count}
        res.sendSucc('查询订单成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })     
    },    
    async payQuery(req, res){
      if (!req.checkFormBody(['id'], res)) return

      const result = await pay.query({out_trade_no: req.params.id});
      res.sendSucc('查询订单成功!', result)
    },
    async payrefunds(req, res){

      let total = await sqlExcute(`SELECT total_price FROM orders AS Total where order_id = ?`, req.params.id)
      if( total.length == 0){
        res.sendErr(401,'订单不存在，请仔细检查！')
        return
      }

      const params = {
        out_trade_no: req.params.id,
        out_refund_no: req.params.id,
        reason: '商品退款',
        amount: {
          refund: total[0].total_price * 100,
          total: total[0].total_price * 100,
          currency: 'CNY',
        },
        notify_url:'https://erxiaomen.top/v1/weixinpay/payNotify/'
      };
      const result = await pay.refunds(params);

      res.sendSucc('正在处理退款', result)
    },

    payrefundsNotify(req, res){
      // 申请的APIv3
      
      let key = 'beijingzaiwujiyeyouxiangong12345';
      let { ciphertext, associated_data, nonce } = req.body.resource;
      // 解密回调信息
      const result = pay.decipher_gcm(ciphertext, associated_data, nonce, key);
      // 拿到订单号
      let { out_trade_no } = result;
      if (result.status == 'SUCCESS') {
          // 支付成功之后需要进行的业务逻辑
      update_the_order = `UPDATE orders SET status = 2 WHERE order_id = ? AND status = 0`
          sqlExcute(update_the_order, out_trade_no).then(result=>{
            res.send( {"code": 200,"message": ""})
            }).catch(err=>{
              res.sendErr(500, err.message)
            })

          console.log("退款成功！")
      }else if(result.status == 'PROCESSING'){
          console.log("正在退款商品!")      
      }      
    },

    async payfind_refunds(req, res){
      if (!req.checkFormBody(['id'], res)) return

      const result = await pay.find_refunds(req.params.id);
      res.sendSucc('查询订单状态成功!', result)
    },

    async orderCount(req, res){
      if (!req.checkFormBody(['id'], res)) return
        countfind = `SELECT * FROM orders SET status = 2 WHERE order_id = ? AND status = 0`
          sqlExcute(countfind, out_trade_no).then(result=>{
            res.send( {"code": 200,"message": ""})
            }).catch(err=>{
              res.sendErr(500, err.message)
            })
      res.sendSucc('查询订单状态成功!', result)
    },
    async SendGood(req, res){
      if (!req.checkFormBody(['id'], res)) return
      const id = parseInt(req.params.id)
      sendgood = `UPDATE orders SET ifsend = 1, send_time = ? WHERE id = ?`
      send_time = moment().format('YYYY-MM-DD HH:mm:ss')
      sqlExcute(sendgood, [ send_time,id])
      .then(result => {
        res.sendSucc('发货成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })   
  
    },   
    async notSendGood(req, res){
      if (!req.checkFormBody(['id'], res)) return

      const id = parseInt(req.params.id)
      sendgood = `UPDATE orders SET ifsend = 0  WHERE id = ?`

      sqlExcute(sendgood, id)
      .then(result => {
        res.sendSucc('取消发货成功!', result)
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })   
  
    },      
    async ordershassend(req, res){
      if (!req.checkFormBody(['page', 'pageSize'], res)) return
      const pageSize = parseInt(req.query.pageSize)
      const page = parseInt(req.query.page)
      const count = await sqlExcute(`SELECT COUNT(*) AS count FROM orders  WHERE ifsend = 1 OR ifsend = 2`)
      sendgood = `SELECT * FROM orders  WHERE ifsend = 1 OR ifsend = 2 ORDER BY create_time DESC LIMIT ?, ? `
      sqlExcute(sendgood, [(page - 1) * pageSize, pageSize])
      .then(result => {
        
        res.sendSucc('发货订单查询成功!', { result , 'count' : count[0].count})
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })   
  
    },    
    async orderStatusCount(req, res){
      // if (!req.checkFormBody(['id'], res)) return
      let user_id = req.userInfo.id
      weifahuoSQL = `SELECT COUNT(*) AS count FROM orders WHERE now() < expire_time AND status = 0 AND user_id = ?`
      weifahuo = await sqlExcute(weifahuoSQL, user_id)
      StatusCount = `SELECT ifsend , COUNT(*) AS count FROM orders WHERE user_id = ? AND status = 1 GROUP BY ifsend`

      sqlExcute(StatusCount, user_id)
      .then(result => {
        ordsercount = {}
        ordsercount.weizhifu = weifahuo[0].count
        ordsercount.yifahuo = 0
        ordsercount.weifahuo = 0
        result.forEach(element => {
          if(element.ifsend == '0') ordsercount.weifahuo += element.count
          if(element.ifsend == '1') ordsercount.yifahuo += element.count
        });
 
        res.sendSucc('查询订单成功!', ordsercount )
      })
      .catch(e => {
        res.sendErr(500, e.message)
      })   
  
    }    
}