const exprss = require('express')
const router = exprss.Router()
const multer = require('multer')
const mkdirp = require('mkdirp')
const moment = require('moment')
const path=require('path')

// 获取当前的日期
const nowDate = moment().format('YYYY-MM-DD')

// 封装保存上传文件功能
const upload = ()=>{
    const storage  = multer.diskStorage({
        destination:async (req,file,cb)=>{ // 指定上传后保存到哪一个文件夹中
            await mkdirp(`public/uploadimg/${nowDate}`)  // 创建目录
            cb(null,`public/uploadimg/${nowDate}`) //
        },
        filename:(req,file,cb)=>{ // 给保存的文件命名
            let extname = path.extname(file.originalname); // 获取后缀名
    
            let fileName = path.parse(file.originalname).name // 获取上传的文件名
            cb(null,`${fileName}-${Date.now()}${extname}`)
        }
    })

    return multer( {storage})
}




router.post('/',upload().single('pic'),(req,res)=>{
    res.send({  // 给前端返回的数据
        body: req.body,
        file: req.file,
        path: `https://erxiaomen.top${req.file.destination.replace('public','')}/${req.file.filename}`
    });
})



module.exports = router
