const sqlExcute = require('../db')
const config = require('../config')
const request = require('request-promise');
const { options } = require('../db/db');

async function getAccess_token(){
    const options = {
        method: 'GET',
        url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx41f299b907aab42f&secret=dd7cbbf16d94425c9ff15ea1e489b246',                  
    }
    Access_token = undefined
    await request(options,function(error,response,body){
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body)
          console.log(body['access_token']) // 请求成功的处理逻辑
          Access_token = body['access_token']
          
        }  
    });
      
    return Access_token

}


module.exports ={
    
    async CreateTrackid(req, res){
        if (!req.checkFormBody(['id'], res)) return

        id = req.params.id
        order_info = await sqlExcute(`SELECT * FROM orders AS OD INNER JOIN users AS US ON OD.user_id = US.id WHERE OD.id = ?`,id)
        if(order_info == undefined){
            res.sendErr(501, '订单无效，请检查订单有效性！')
            return
        }
        order_info = order_info[0]
        access_token = await getAccess_token()
        const options = {
            method: 'POST',
            url: 'https://api.weixin.qq.com/cgi-bin/express/business/order/add?access_token=' + access_token,  
            body : {
                    add_source: 0,
                    order_id: order_info.order_id,
                    openid: order_info.openid,
                    delivery_id: config.weixin.delivery_id,
                    biz_id: config.weixin.biz_id,
                    custom_remark: "酒",
                    sender: {
                        name: "安红",
                        tel: "15210610188",
                        mobile: "15210610188",
                        country: "中国",
                        province: "北京市",
                        city: "北京市",
                        area: "海淀区",
                        address: "清华科技园创业大厦"
                    },
                    receiver: {
                        name: order_info.receiver_name,
                        tel: order_info.mobile,
                        mobile: order_info.mobile, 
                        country: "中国",
                        province:order_info.province,
                        city: order_info.city,
                        area: order_info.area,
                        address: order_info.detailed_address
                    },
                    shop: {
                        detail_list: [
                            {
                                "goods_name": "酒",
                                "goods_img_url": "https://erxiaomen.top/uploadimg/2023-01-16/6b04871050b13c5c71373a959a0c2ec-1673840360396.png",
                                "goods_desc": "20cm * 20cm尺寸"
                            },
                        ]
                    },
                    cargo: {
                        count: 1,
                        weight: 1,
                        space_x: 30.5,
                        space_y: 20,
                        space_z: 20,
                        detail_list: [
                        {
                            name: "酒",
                            count: 1
                        }
                        ]
                    },
                    insured: {
                        use_insured: 0,
                        insured_value: 0
                    },
                    service: {
                        service_type: 0,
                        service_name: "标准快递"
                    }
                             
            },
            json: true

        }
        
        result = undefined
        await request(options,function(error,response,body){
            if (!error && response.statusCode == 200) {
            
              result = body
            }  
        });
        if(result.waybill_id == undefined || result.waybill_id == ""){
            res.sendErr("创建运单失败")
            return
        }
        await sqlExcute(`UPDATE orders SET track_id = ? WHERE id = ?`,[result.waybill_id,id])
        res.sendSucc("成功！",result)

    },    
    async CancelTrackid(req, res){
        if (!req.checkFormBody(['id'], res)) return
        id = req.params.id
        orderinfo =  await sqlExcute(`SELECT OD.order_id, US.openid, OD.track_id FROM orders AS OD INNER JOIN users AS US ON OD.user_id = US.id WHERE OD.id = ?`, id);
        orderinfo = orderinfo[0]
        access_token = await getAccess_token()
        const options = {
            method: 'POST',
            url: 'https://api.weixin.qq.com/cgi-bin/express/business/order/cancel?access_token=' + access_token +'&debug=1',  
            body : {
                order_id : orderinfo.order_id,  
                openid :  orderinfo.openid,     
                delivery_id : config.weixin.delivery_id,
                waybill_id : orderinfo.track_id                
            },
            json: true

        }   
        result = undefined
        await request(options,function(error,response,body){
            if (!error && response.statusCode == 200) {
            
              result = body
              
            }  
        });
        await sqlExcute(`UPDATE orders SET ifsend = 2 WHERE id = ?`, id);
        res.sendSucc("成功！",result)             
    },
    async getTrack(req, res){
        if (!req.checkFormBody(['id'], res)) return
        id = req.params.id
        orderinfo =  await sqlExcute(`SELECT OD.order_id, OD.track_id FROM orders AS OD WHERE OD.id = ?`, id);
        if(orderinfo.length == 0){
            res.sendErr(501, '无效的id!')
            return
        }
        orderinfo = orderinfo[0]
        if(orderinfo.track_id == undefined){
            res.sendErr(501, '此订单还没有生成运单!')
            return   
        }
        waybill_id =  orderinfo.track_id
        access_token = await getAccess_token()
        const options = {
            method: 'POST',
            url: 'https://api.weixin.qq.com/cgi-bin/express/business/path/get?access_token=' + access_token +'&debug=1',  
            body : {
                order_id :orderinfo.order_id,         
                delivery_id : config.weixin.delivery_id,
                waybill_id : waybill_id                
            },
            json: true

        }
        
        result = undefined
        await request(options,function(error,response,body){
            if (!error && response.statusCode == 200) {
            
              result = body
            }  
        });
        res.sendSucc("成功！",result)

    },
    async SuccessTrackid(req, res){
        if (!req.checkFormBody(['id'], res)) return
        id = req.params.id
        sqlExcute(`UPDATE orders SET ifsend = 3 WHERE id = ?`, id).then(result =>{

            res.sendSucc("成功！",result)
        })
        
        
        

    },   
    async CallBack(req, res){
        // req.query.
        
        for(element in req.body.Actions){
            if(req.body.Actions[element].ActionType == 300003)
                await sqlExcute(`UPDATE orders SET ifsend = 3 WHERE order_id = ?`,req.body.OrderId);
            if(req.body.Actions[element].ActionType == 400001)
                await sqlExcute(`UPDATE orders SET ifsend = 2 WHERE order_id = ?`,req.body.OrderId);
        }

        res.send("success") 
        
        
        
        

    },  
    async testTrack(req, res){

        if (!req.checkFormBody(['id','action_type','action_msg'], res)) return
        access_token = await getAccess_token()
        orderinfo =  await sqlExcute(`SELECT OD.order_id, OD.track_id FROM orders AS OD WHERE OD.id = ?`, req.params.id);
        const options = {
            method: 'POST',
            url: 'https://api.weixin.qq.com/cgi-bin/express/business/test_update_order?access_token=' + access_token +'&debug=1',  
            body : {
                biz_id: config.weixin.biz_id,
                order_id: orderinfo[0].order_id,
                delivery_id: config.weixin.delivery_id,
                waybill_id: orderinfo[0].track_id,
                action_time: 1676682906,
                action_type: req.query.action_type,
                action_msg: req.query.action_msg              
            },
            json: true

        }   
        await request(options,function(error,response,body){
            if (!error && response.statusCode == 200) {
            
              result = body
              
            }  
        });
        res.sendSucc(result) 
        
        
        
        
        
    },         
}