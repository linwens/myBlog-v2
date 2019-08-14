'use strict'
import express from 'express';
const router = express.Router();
//用户操作
import {Login, Regist, getUserInfo, Logout} from '../module/users'
//文章操作
import {Subarticle, Removearticle, Getarticle, Getlist, Gettags} from '../module/articles'
//html5相关操作----功能重复后期考虑优化
import {subH5, RemoveH5, Geth5list, GetH5} from '../module/html5'
//图片操作
import {ImgUpload, ImgInfosave, Getimglist, RemoveImg, Getimginfo, GetThemes, MNPimgList, MNPimgThemes, changeURL} from '../module/imgHandler'
//登录
router.post('/login',function(req, res, next){
    Login(req, res, next);
});
//获取用户信息
router.get('/info',function(req, res, next){
  getUserInfo(req, res, next);
});
//登出
router.post('/logout',function(req, res, next){
    Logout(req, res, next);
});
//注册,暂不开放
router.post('/regist', function(req, res, next){
    Regist(req, res, next);
});
//提交文章
router.post('/subArticle', function(req, res, next){
    Subarticle(req, res, next);
});
//删除文章
router.post('/removeArticle', function(req, res, next){
    Removearticle(req, res, next);
});
//获取文章
router.get('/getArticle',function(req, res, next){
    Getarticle(req, res, next);
});
//获取文章列表
router.get('/getList',function(req, res, next){
    Getlist(req, res, next);
});
//获取标签
router.get('/getTags',function(req, res, next){
    Gettags(req, res, next);
});
/* //提交H5
router.post('/subH5', function(req, res, next){
    subH5(req, res, next);
});
//删除H5
router.post('/removeH5', function(req, res, next){
    RemoveH5(req, res, next);
});
router.get('/getH5', function(req, res, next){
    GetH5(req, res, next);
});
//获取H5列表
router.get('/getH5list',function(req, res, next){
    Geth5list(req, res, next);
}); */
//图片上传
router.post('/uploadImg', function(req, res, next){
    ImgUpload(req, res, next);
});
//图片信息存储
router.post('/saveImg', function(req, res, next){
    ImgInfosave(req, res, next);
});
//获取图片列表
router.get('/getImglist',function(req, res, next){
    Getimglist(req, res, next);
});
//删除图片
router.post('/removeImg', function(req, res, next){
    RemoveImg(req, res, next);
});
//获取所有作品主题
router.get('/imgThemes', function(req, res, next){
  GetThemes(req, res, next);
});
//改地址图片(20190418 就改一次，不对外)
// router.post('/changeURL', function(req, res, next){
//     changeURL(req, res, next);
// });
//获取图片信息
router.get('/getImginfo',function(req, res, next){
    Getimginfo(req, res, next);
});
// 小程序图片获取
router.get('/mnp/imgList', function(req, res, next){
    MNPimgList(req, res, next);
})
// 获取题材
router.get('/mnp/themeList', function(req, res, next){
    MNPimgThemes(req, res, next);
})
// 测试用
router.get('/test/jsonp', function(req, res, next) {
  console.log('---------------1----------')
  console.log(req.query)
  console.log(res.jsonp)
  var response =({
    first_name:req.query.first_name,
    last_name:req.query.last_name
  });
  res.jsonp(response); 
  //res.send(req.query.callback+'('+JSON.stringify(response)+')');//jsonp格式
})
module.exports = router;
