'use strict'
import express from 'express';
const router = express.Router();
//用户操作
import {Login, Regist, getUserInfo, Logout} from '../module/users'
//文章操作
import {Subarticle, Removearticle, Getarticle, Getlist, Gettags} from '../module/articles'
//图片操作
import {ImgUpload, ImgInfosave, Getimglist, RemoveImg, Getimginfo, GetThemes, MNPimgList, MNPimgThemes, changeURL} from '../module/imgHandler'
// npm操作
import { GetNPMlist, AddNPM, ShowNPM, RemoveNPM} from '../module/npms'

//----------------------------用户相关----------------------------
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
//----------------------------文章相关----------------------------
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
//----------------------------npm相关----------------------------
//获取npm列表
router.get('/getnpmlist',function(req, res, next){
  GetNPMlist(req, res, next);
});
router.post('/addnpm',function(req, res, next){
  AddNPM(req, res, next);
});
router.post('/shownpm',function(req, res, next){
  ShowNPM(req, res, next);
});
router.post('/removenpm',function(req, res, next){
  RemoveNPM(req, res, next);
});
//----------------------------图片相关----------------------------
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
//----------------------------微信图片相关----------------------------
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
  var response =({
    first_name:req.query.first_name,
    last_name:req.query.last_name
  });
  res.jsonp(response); 
  //res.send(req.query.callback+'('+JSON.stringify(response)+')');//jsonp格式
})
module.exports = router;
