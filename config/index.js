module.exports = {
  secret: 'itcast-wh',
  tokenExpire: 2592000, // 一个月到期时间 单位为秒,
  default_module: 'api',
  weixin: {
    appid: 'wx41f299b907aab42f', // 小程序 appid
    secret: 'dd7cbbf16d94425c9ff15ea1e489b246', // 小程序密钥
    mch_id: '1630861453', // 商户帐号ID
    partner_key: 'beijingzaiwujiyeyouxiangong12345', // 微信支付密钥
    notify_url: '', // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
    delivery_id: 'JDL', // 'JDL'
    biz_id : '010K2253982' // '010K2253982'    
    // delivery_id: 'TEST', // 'JDL'
    // biz_id : 'test_biz_id' // '010K2253982'
  },
  express: {
    // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/
    appid: '1782211', // 对应快递鸟用户后台 用户ID
    appkey: 'bf537cee-a5ae-4633-a96e-cc8dd18e520c', // 对应快递鸟用户后台 API key
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  }  
} 