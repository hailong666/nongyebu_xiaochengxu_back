const express = require('express');
const router = express.Router();
const ctrl = require('../../controller')



// router.get('/getAccess_token/', ctrl.wuliu.getAccess_token)

router.get('/getTrack/:id', ctrl.wuliu.getTrack)

router.get('/CreateTrackid/:id', ctrl.wuliu.CreateTrackid)

router.get('/CancelTrackid/:id', ctrl.wuliu.CancelTrackid)

router.get('/SuccessTrackid/:id', ctrl.wuliu.SuccessTrackid)

router.post('/CallBack/', ctrl.wuliu.CallBack)

router.get('/testTrack/:id', ctrl.wuliu.testTrack)




module.exports = router;