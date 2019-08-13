import {Img} from './mongoose';
import multer from 'multer';
import qiniu from 'qiniu';
import uuid from 'node-uuid';


//multer配置
//存为buffer
var storage = multer.memoryStorage();
var multerConf = multer({
    storage: storage,
    limits:{
        fileSize:2097152 //2M
    },
    fileFilter:function(req, file, cb){
        var type = '|' + file.mimetype.slice(file.mimetype.lastIndexOf('/') + 1) + '|';
        var fileTypeValid = '|jpg|png|x-png|jpeg|'.indexOf(type) !== -1;
        cb(null, !!fileTypeValid);
    }
}).single('imgFiles');
//图片上传
exports.ImgUpload = function(req, res, next){
  console.log(req.file)
    //传七牛
    multerConf(req, res, function(err){
        //req.body.bucketType
        //七牛配置---生成token
        var accessKey = 'Y_k8Ymui6QCIKcg_dENCZR3TGgZ_aP65jwnj3KCU';
        var secretKey = 'oWRin6KjO5dD1SGmjT9jIRaBG0d02lX5AdFwWpqn';
        //var bucket = 'linwens-img';
        var bucket = req.body.bucketType === 'galleryImg'?'linwens-img':'blog-img';//配置上传不同传出空间
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var options = {
            scope: bucket,
            returnBody: '{"key":"$(key)","hash":"$(etag)","width":"$(imageInfo.width)","height":"$(imageInfo.height)","model":"$(exif.Model.val)","iso":"$(exif.ISOSpeedRatings.val)","shutter":"$(exif.ExposureTime.val)","aperture":"$(exif.FNumber.val)","Flength":"$(exif.FocalLength.val)"}'
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(mac);
        //----找到七牛机房
        var config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z0;

        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        var key = req.file.originalname;

        if(err){
            console.log(err);
        }else{
            if(req.file&&req.file.buffer){
                formUploader.put(uploadToken, key, req.file.buffer, putExtra, function(respErr,
                  respBody, respInfo) {
                    if (respErr) {
                        throw respErr;
                    }
                    console.log(respBody)
                    if (respInfo.statusCode == 200) {
                        var exifObj = {};
                            exifObj.model = respBody.model;
                            exifObj.iso = respBody.iso;
                            exifObj.shutter = respBody.shutter;
                            exifObj.aperture = respBody.aperture;
                            exifObj.Flength = respBody.Flength;
                        //{ hash: 'FvGzDnfjqLmcB6AF2EV1hhQvzcrd', key: 'cogis.jpg' }
                        // res.json({//返回前端外链地址，前端再提交放入数据库
                        //     res_code:'0',
                        //     res_msg:'上传成功',
                        //     size:respBody.width+'x'+respBody.height,
                        //     exif:exifObj,
                        //     backUrl:(bucket==='linwens-img'?'http://osurqoqxj.bkt.clouddn.com/':'http://otvt0q8hg.bkt.clouddn.com/')+respBody.key
                        // })
                        res.send(JSON.stringify({//返回前端外链地址，前端再提交放入数据库
                            res_code:'0',
                            res_msg:'上传成功',
                            size:respBody.width+'x'+respBody.height,
                            exif:exifObj,
                            backUrl:(bucket==='linwens-img'?'http://gallery.shy-u.top/':'http://blog.shy-u.top/')+respBody.key
                        }))
                    } else {
                        console.log(respInfo.statusCode);
                        console.log(respBody);
                    }
                });
            }
        }
    }) 
};
//图片信息存入数据库
exports.ImgInfosave = function(req, res, next){
    var img = new Img({
        time: Math.round(Date.parse(new Date())/1000),
        title:req.body.title,
        desc: req.body.desc,
        theme: req.body.theme,
        size: req.body.size,
        url: req.body.url,
        exif:JSON.parse(req.body.exif),
        type:req.body.type,
        gid:uuid.v1()
    });
    //判断是修改还是新加
    if(req.body.option&&req.body.option=='modify'){
        Img.update({gid:req.body.gid}, {title: req.body.title, desc: req.body.desc, theme: req.body.theme})
        .then((data)=>{
            res.json({
                res_code:1,
                res_msg:'图片信息修改成功'
            })
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                res_code:4,
                res_msg:'图片信息修改失败'
            })
        })
    }else{
        Img.find({url:req.body.url})
        .then((data)=>{
            if(data&&data!=''){
                return Promise.reject('图片信息已存在');
            }else{
                return img
            }
        })
        .then((img)=>{
            img.save()
            .then((data)=>{
                res.json({
                    res_code:1,
                    res_msg:'图片信息保存成功'
                })
            })
            .catch((err)=>{
                console.log(err);
                res.json({
                    res_code:4,
                    res_msg:'图片信息保存失败'
                })
            })
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                res_code:4,
                res_msg:err
            })
        })
    }
}
//获取图片列表(需要做缓存处理)
exports.Getimglist = function(req, res, next){
    var schWord = req.query.schWord?req.query.schWord:null,
        curPage = req.query.curPage?parseInt(req.query.curPage):1,
        pageSize = req.query.pageSize?parseInt(req.query.pageSize):10,
        imgType = req.query.dataType?req.query.dataType:'galleryImg',
        findParams = {'type':imgType};//只筛选摄影作品 add by lws 2017.9.28
    if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
        var schRegExp = new RegExp(schWord,"i");
        findParams = {"$or":[{'desc':schRegExp}], 'type':imgType};//图片搜索只根据图片描述进行搜索
    }
    Img.count(findParams)
    .then((total)=>{
        Img.find(findParams)
        .skip((curPage-1)*pageSize)
        .limit(pageSize)
        .sort({time:-1})
        .then((data)=>{
            if(data&&data!=''){
                var galleryImglist = [];
                for(var i = 0;i<data.length;i++){
                    if(data[i].type ===imgType){
                        galleryImglist.push(data[i]);
                    }
                }
                res.json({
                    res_code:1,
                    dataList:galleryImglist,
                    page:curPage,
                    page_size:pageSize,
                    total:total
                })
            }else{
                res.json({
                    res_code:2,
                    dataList:data,
                    page:curPage,
                    page_size:pageSize,
                    total:0,
                    res_msg:'这题材我还没拍'
                })
            }
        })
        .catch((err)=>{
            console.log(err);
            res.json({
                res_code:4,
                res_msg:'图片列表数据出错'
            })
        })
    })
    .catch((err)=>{
        console.log(err);
        res.json({
            res_code:4,
            res_msg:'获取图片总条数出错'
        })
    });
}
//图片删除
exports.RemoveImg = function(req, res, next){
    Img.remove({gid:req.body.gid})
    .then((data)=>{
        if(data&&data!=''){
            res.json({
                res_code:1,
                res_msg:'图片删除成功'
            })
        }else{
            res.json({
                res_code:2,
                res_msg:'图片不存在'
            })
        }
    })
    .catch((err)=>{
        console.log(err);
        res.json({
            res_code:4,
            res_msg:'图片删除出错'
        })
    });
};
//图片详情获取
exports.Getimginfo = function(req, res, next){
    Img.find({gid:req.query.gid})
    .then((data)=>{
        if(data&&data!=''){
            res.json({
                res_code:1,
                imgInfo:{
                    time:data[0].time,
                    title:data[0].title,
                    desc:data[0].desc?data[0].desc:'获取的图片没有描述',
                    size: data[0].size,
                    url:data[0].url,
                    exif:data[0].exif,
                    type:data[0].type
                }
            })
        }else{
            res.json({
                res_code:2,
                res_msg:'图片不存在'
            })
        }
    })
    .catch((err)=>{
        console.log(err);
        res.json({
            res_code:4,
            res_msg:'获取图片详情错误'
        })
    });
};
// 获取小程序图片题材列表
exports.MNPimgThemes = function(req, res, next){
    // 写死类型的描述与标题
    var allTheme = {
        'people': {
            brief: '关于人像',
            title: '人像摄影'
        },
        'pets': {
            brief: '关于宠物',
            title: '宠物摄影'
        },
        'sence': {
            brief: '关于风光',
            title: '风光摄影'
        }
    }
    Img.find({})
	.sort({time:-1})
	.then((data)=>{
		if(data&&data!=''){//(js的concat()方法)
			//筛选出标签
			let themesArr = [];
			for(let i=0;i<data.length;i++){
				themesArr = themesArr.concat(data[i].themes)
			}
			//数组去重：new Set()去重，Array.from()转换为数组
            let themes = Array.from(new Set(themesArr));
            let themeList = [];
            // 肯定非常耗时
            for (let i = 0; i < themes.length; i++) {
                if (allTheme[themes[i]]) {
                    themeList[i] = allTheme[themes[i]]
                    for(var j = 0;j<data.length;i++){
                        if(data[j].theme === themes[i]){
                            themeList[i].cover = data[j].url
                        }
                    }
                }
            }

			res.json({
			    res_code:1,
			    themeList:themeList
            })
		}else{
			return Promise.reject(2)
		}
	})
	.catch((err)=>{
		console.log('Articles.find-----err');
		console.log(err);
		switch(err){
			case 2 :
				res.json({
					res_code:2,
					res_msg:'无任何主题'
				});
			break;
			default:
				res.json({
					res_code:4,
					res_msg:'请求主题出错'
				})
		}
	});
    res.json({
        res_code:1,
        info:{
            sum: total,
            brief: allTypes[type].brief,
            title: allTypes[type].title,
            cover: data[0].url
        }
    })
}
// 获取小程序图片列表
exports.MNPimgList = function(req, res, next){
    var curPage = req.query.curPage?parseInt(req.query.curPage):1,
        pageSize = req.query.pageSize?parseInt(req.query.pageSize):10,
        theme = req.query.theme?req.query.theme:'new',
        findParams = { 'theme': theme};
    
    Img.count(findParams)
    .then((total)=>{
        Img.find(findParams)
        .skip((curPage-1)*pageSize)
        .limit(pageSize)
        .sort({time:-1})
        .then((data)=>{
            if(data&&data!=''){
                var imglist = [];
                for(var i = 0;i<data.length;i++){
                    if(data[i].theme === theme){
                        imglist.push(data[i]);
                    }
                }
                res.json({
                    res_code:1,
                    dataList:imglist,
                    page:curPage,
                    page_size:pageSize,
                    total:total
                })
            }else{
                res.json({
                    res_code:2,
                    dataList:data,
                    page:curPage,
                    page_size:pageSize,
                    total:0,
                    res_msg:'这题材我还没拍'
                })
            }
        })
    }).catch((err)=>{
        console.log(err);
        res.json({
            res_code:4,
            res_msg:'小程序图片列表数据出错'
        })
    })
};
//修改地址(20190418 就改一次，不对外)
exports.changeURL = function(req, res, next){
    var allImg = null;
    Img.find().then((data)=>{
        allImg = data;
        return allImg
    }).then((data)=>{
        console.log('======================')
        console.log(data)
        data.forEach(element => {
            var url = '';
            var reg1 = /osurqoqxj.bkt.clouddn.com/g;
            var reg2 = /otvt0q8hg.bkt.clouddn.com/g;
            // if(reg1.test(element.url)){ // 照片
               
            // }
            // if(reg2.test(element.url)){ // 截图
            //    url = element.url.replace('otvt0q8hg.bkt.clouddn.com', 'blog.shy-u.top') 
            // }
            if(element.type==='galleryImg'){
                url = element.url.replace(/osurqoqxj.bkt.clouddn.com|otvt0q8hg.bkt.clouddn.com/g, 'gallery.shy-u.top') 
            }
            if(element.type==='blogImg'){
                url = element.url.replace(/osurqoqxj.bkt.clouddn.com|otvt0q8hg.bkt.clouddn.com/g, 'blog.shy-u.top') 
            }
            Img.update({gid: element.gid}, {url: url}).then((data)=>{  
                console.log('修改以后-------------')
                console.log(url)
            });
            // element.url = url;
        });
    });
    
}