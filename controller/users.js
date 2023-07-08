const sqlExcute = require('../db')
const svgCaptcha = require('svg-captcha')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const secret = config.secret
const weixin = require('./weixin')
const moment = require('moment')

// SQL语句
const getUserCountSql = 'SELECT US.id, US.username, US.headImgUrl, US.openid, US.ctime, UA.token FROM users AS US INNER JOIN users_auth AS UA ON US.id = UA.user_id WHERE US.openid = ?'
const addUserSql = 'INSERT INTO users SET ?'
const addUserTokenSql = 'INSERT INTO users_auth SET ?'
const getUserInfoSql = `SELECT u.id, u.username, u.headImgUrl, u.openid ,ua.token, ua.ctime
                        FROM users AS u 
                        LEFT JOIN users_auth AS ua 
                        ON u.id = ua.user_id 
                        WHERE username = ?
                        ORDER BY ua.ctime DESC
                        LIMIT 0, 1`
const updateUserInfoSql = `UPDATE users
                          SET ?
                          WHERE id = ?`
const getReceiverAddressSql = `SELECT id, receiver_name,from2, mobile, postcode, province, city, area, detailed_address
                              FROM receiver_address
                              WHERE user_id = ?`
const deleteReceiverAddressSql = `DELETE FROM receiver_address
                                  WHERE id = ?`
const addReceiverAddressSql = `INSERT INTO receiver_address SET ?`

const getReceiverAddressByIdSql = getReceiverAddressSql + ' AND id = ?'

const updateReceiverAddressSql = `UPDATE receiver_address
                                  SET ?
                                  WHERE id = ?
                                  AND user_id = ?`

const updateReceiverAddressSql_shiwu = `START TRANSACTION; 
          UPDATE receiver_address SET postcode = 2 WHERE user_id = ? AND postcode = 1;
                                  UPDATE receiver_address
                                  SET ?
                                  WHERE id = ?
                                  AND user_id = ?;
                                  COMMIT;
                                  `                                  

const setAllReceiverCommonUsedToZeroSql = 'UPDATE receiver_address SET common_used = 0 WHERE user_id = ?'

module.exports = {
async registerAction(req, res) {

    let attrs = ['username', 'headImgUrl', 'code']

    // if (!req.checkFormBody(attrs, res)) return
    if(!req.query.code || !req.query.headImgUrl || !req.query.username) return
    // if (!req.session.vCode || req.session.vCode.toLowerCase() != req.body.vCode.toLowerCase()) return res.sendErr(400, '验证码错误!')

    // req.body.password = bcrypt.hashSync(req.body.password, 10)

    let userInfo = { ctime: moment().format('YYYY-MM-DD HH:mm:ss') }

    // attrs.forEach(attr => {
    //   userInfo[attr] = req.body[attr]
    // })
    userInfo['username'] = req.query.username
    userInfo['code'] = req.query.code
    userInfo['headImgUrl'] = req.query.headImgUrl
    // delete userInfo.vCode
    
    openid = await weixin.login(userInfo['code'], userInfo['username'])
    if(!openid){
      res.sendErr(400, "获取openid错误,请检查用户合法性！")
      return
    }
    await sqlExcute(getUserCountSql, [openid])
      .then(result => {
        if (result.length > 0) {
          res.sendSucc('用户名已存在!',result[0])
          return
        }
        
        
        

        userInfo['openid'] = openid
        return sqlExcute(addUserSql, userInfo)
      })
      .then(result => {
        if (result.affectedRows) {
          // delete userInfo.password

          let token = jwt.sign({ secret }, secret, {
            expiresIn: config.tokenExpire
          })
          let ctime = moment().format('YYYY-MM-DD HH:mm:ss')
          const tokenInfo = {
            user_id: result.insertId,
            token,
            ctime
          }
          userInfo.token = token
          userInfo.id = result.insertId
          return sqlExcute(addUserTokenSql, tokenInfo)
        }
      })
      .then(result => {
        if (result.affectedRows) {
          res.sendSucc('注册成功!', userInfo)
        }
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })

  },


  registerUser(req, res){
    var a = 3
    
  },
  // getVCodeAction(req, res) {
  //   const codeConfig = {
  //     size: 4,// 验证码长度
  //     ignoreChars: '0o1i', // 验证码字符中排除 0o1i
  //     noise: 5, // 干扰线条的数量
  //     width: 100
  //   }
  //   const vCode = svgCaptcha.create(codeConfig)
  //   req.session.vCode = vCode.text
  //   console.log(vCode.text)
  //   // res.type('svg')
  //   res.send(vCode.data)
  // },
  // checkUsernameAction(req, res) {

  //   let attrs = ['username']

  //   if (!req.checkFormBody(attrs, res)) return

  //   sqlExcute(getUserCountSql, req.params.username)
  //     .then(result => {
  //       if (result[0].count > 0) throw new Error(req.params.username + '用户名已存在!')
  //       res.sendSucc(req.params.username + '用户名可用!')
  //     })
  //     .catch(e => {
  //       res.sendErr(400, e.message)
  //     })
  // },
  loginAction(req, res) {

    let attrs = ['username']

    if (!req.checkFormBody(attrs, res)) return

    const userInfo = {
      username: req.body.username,
    }

    sqlExcute(getUserInfoSql, userInfo.username)
      .then(result => {
        if (!result || result.length === 0) throw new Error('用户名不存在!')
        let tokenInfo = {
          username:userInfo.username,
          id: result[0].id,
          token: result[0].token,
          ctime: result[0].ctime,
          openid:result[0].openid
        }
          res.sendSucc('登录成功!', tokenInfo)
    
        // if (bcrypt.compareSync(req.body.password, hash)) {
        //   userInfo.id = result[0].id
        //   userInfo.nickname = result[0].nickname
        //   userInfo.mobile = result[0].mobile
        //   userInfo.token = result[0].token
        //   if (!userInfo.token || (Date.now() - new Date(result[0].ctime)) / 1000 >= config.tokenExpire) {
        //     userInfo.token = jwt.sign({ secret }, secret, {
        //       expiresIn: config.tokenExpire
        //     })

        //   }
        //   delete userInfo.password
        //   res.sendSucc('登录成功!', userInfo)
        // } else {
        //   throw new Error('登录失败!密码错误!')
        // }
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },

  getUserInfoAction(req, res) {
    res.sendSucc('获取用户信息成功!', req.userInfo)
  },
  updateUserInfoAction(req, res) {

    let attrs = ['mobile']

    if (!req.checkFormBody(attrs, res)) return

    let userInfo = { mobile: req.body.mobile }

    sqlExcute(updateUserInfoSql, [userInfo, req.userInfo.id])
      .then(result => {
        if (result.affectedRows) {
          req.userInfo.mobile = req.body.mobile
          res.sendSucc('用户信息修改成功!', req.userInfo)
        }
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  updatePasswordAction(req, res) {

    let attrs = ['oldPassword', 'newPassword']

    if (!req.checkFormBody(attrs, res)) return

    sqlExcute(getUserInfoSql, req.userInfo.username)
      .then(result => {
        if (!result || result.length === 0) throw new Error('用户名不存在!')
        const hash = result[0].password
        if (bcrypt.compareSync(req.body.oldPassword, hash)) {
          let password = bcrypt.hashSync(req.body.newPassword, 10)
          return sqlExcute(updateUserInfoSql, [{ password }, req.userInfo.id])
        } else {
          throw new Error('修改密码失败!密码错误!')
        }
      })
      .then(result => {
        if (result.affectedRows) {
          res.sendSucc('修改密码成功!')
        }
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  getReceiverAddressAction(req, res) {
    sqlExcute(getReceiverAddressSql, req.userInfo.id)
      .then(result => {
        res.sendSucc('获取收货人列表成功!', result)
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },

  getReceiverAddressByIdAction(req, res) {
    sqlExcute(getReceiverAddressSql + ' AND id = ? LIMIT 0, 1', [req.userInfo.id, req.params.id])
      .then(result => {
        if (result.length === 0) throw new Error('获取收货人信息失败!请检查id是否正确!')
        res.sendSucc('获取收货人信息成功!', result[0])
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  deleteReceiverAddressAction(req, res) {
    const receiverId = req.params.id
    sqlExcute(deleteReceiverAddressSql, receiverId)
      .then(result => {
        if (result.affectedRows) res.sendSucc('删除收货人成功!')
        else throw new Error('删除收货人失败!请检查id是否正确!')
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  async addReceiverAddressAction(req, res) {

    let attrs = ['receiver_name','from2', 'mobile', 'postcode', 'province', 'city', 'area', 'detailed_address']

    if (!req.checkFormBody(attrs, res)) return

    let receiverInfo = {}
    attrs.forEach(attr => {
      receiverInfo[attr] = req.body[attr]
    })
    receiverInfo.user_id = req.userInfo.id

    // if (receiverInfo.common_used == 1) await sqlExcute(setAllReceiverCommonUsedToZeroSql, receiverInfo.user_id)

    sqlExcute(addReceiverAddressSql, receiverInfo)
      .then(result => {
        if (result.affectedRows) {
          receiverInfo.id = result.insertId
          res.sendSucc('添加收货人成功!', receiverInfo)
        } else {
          throw new Error('添加收货人失败!')
        }
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  },
  updateReceiverAddressAction(req, res) {
    const receiverId = req.params.id
    let receiverInfo = null
    sqlExcute(getReceiverAddressByIdSql, [req.userInfo.id, receiverId])
      .then(async result => {
        if (!result || result.length === 0) throw new Error('收货人信息不存在!')
  
        receiverInfo = result[0]
        for (let k in receiverInfo) {
          req.body[k] && (receiverInfo[k] = req.body[k])
        }
        if(req.body['postcode'] == 1)
          return sqlExcute(updateReceiverAddressSql_shiwu, [req.userInfo.id,receiverInfo, receiverInfo.id, req.userInfo.id])
        else
          return sqlExcute(updateReceiverAddressSql, [receiverInfo, receiverInfo.id, req.userInfo.id])
      })
      .then(result => {
         res.sendSucc('修改收货人信息成功!', receiverInfo)
        
      })
      .catch(e => {
        res.sendErr(400, e.message)
      })
  }
}