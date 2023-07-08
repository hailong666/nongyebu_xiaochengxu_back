const express = require('express');
const router = express.Router();
const ctrl = require('../../controller')


router.get('/payFQuery/:id', ctrl.weixinpay.payQuery)

router.post('/payFrefunds/:id', ctrl.weixinpay.payrefunds)

router.get('/payFfind_refunds/:id', ctrl.weixinpay.payfind_refunds)

//支付回调
router.post('/payNotify/', ctrl.weixinpay.payNotify)

//退款回调
router.post('/payrefundsNotify/', ctrl.weixinpay.payrefundsNotify)
//支付
router.post('/payAction/', ctrl.weixinpay.payAction)
//创建订单
router.post('/createOrder/', ctrl.weixinpay.CreateOrder)

//获取后台所有通用访问接口
router.get('/orderFindadmin/', ctrl.weixinpay.orderFindadmin)

//获取所有订单
router.get('/orderFind/', ctrl.weixinpay.orderFindall)
//获取某人所有订单
router.get('/orderByIDFind/', ctrl.weixinpay.orderFindById)
//获取某个订单信息
router.get('/orderFinddetail/:id', ctrl.weixinpay.orderFinddetail)
//取消订单
router.get('/cancelorder/:id', ctrl.weixinpay.cancelorder)

//搜索订单
router.get('/orderSeach/', ctrl.weixinpay.orderSeach)

//获取数量
router.get('/orderCount/', ctrl.weixinpay.orderCount)
//获取不同状态的数量
router.get('/orderStatusCount/', ctrl.weixinpay.orderStatusCount)

//点击发货
router.get('/sendgood/:id', ctrl.weixinpay.SendGood)

router.get('/notsendgood/:id', ctrl.weixinpay.notSendGood)
//获取所有已经发货的订单
router.get('/ordershassend/', ctrl.weixinpay.ordershassend)

module.exports = router;