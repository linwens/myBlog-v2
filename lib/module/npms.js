import { Npm } from './mongoose';
import uuid from 'node-uuid';

// 增加npm包
exports.AddNPM = function(req, res, next){
  console.log(req.body)
  //判断是修改还是新加
	if(req.body.option && req.body.option=='modify'){
		Npm.update({nid: req.body.nid}, {name: req.body.name, desc: req.body.desc})
		.then((data)=>{
			res.json({
			    res_code:1,
			    res_msg:'作品修改成功'
			})
		})
		.catch((err)=>{
			console.log(err);
		});
	}else{
    // 新增
    var npm = new Npm({
      time: req.body.time || Math.round(Date.parse(new Date())/1000),
      name: req.body.name,
      desc: req.body.desc,
      publish: 0,
      nid: uuid.v1()
    });
    
		npm.save()
		.then((data)=>{
			res.json({
			    res_code:1,
			    res_msg:'作品保存成功'
			})
		})
		.catch((err)=>{
			console.log(err);
		});
	}
}
// 获取npm列表
exports.GetNPMlist = function(req, res, next){
  //查询条件
	var schWord = req.query.schWord?req.query.schWord:null,
      curPage = req.query.curPage?parseInt(req.query.curPage):1,
      pageSize = req.query.pageSize?parseInt(req.query.pageSize):5,
      status = req.query.status ? req.query.status : [],
      sort = req.query.sort ? parseInt(req.query.sort) : -1,
      findParams = {};//筛选

  // 搜索条件组合
  if(status.length > 0) {
    Object.assign(findParams, {'publish': {"$in": status}})
  }
  if(schWord){//标题，正文，标签内包含关键字(js的RegExp对象)
    var schRegExp = new RegExp(schWord,"i");
    Object.assign(findParams, { "$or":[{'name':schRegExp}, {'desc':schRegExp}] });//图片搜索只根据图片描述进行搜索
  }
  Npm.count(findParams)
    .then((total)=>{
      Npm.find(findParams)
      .skip((curPage-1)*pageSize)
      .limit(pageSize)
      .sort({time: sort})
      .then((data)=>{
        if(data&&data!=''){
          res.json({
              res_code:1,
              dataList:data,
              page:curPage,
              page_size:pageSize,
              total:total
          });
        }else{
          res.json({
            res_code:2,
            dataList:data,
              page:curPage,
              page_size:pageSize,
              total:total,
            res_msg:'暂无相关作品'
          });
        }
      })
      .catch((err)=>{
        console.log(err);
        res.json({
          res_code:4,
          res_msg:'获取npm列表数据出错'
        })
      });
    })
    .catch((err)=>{
      console.log(err);
      res.json({
        res_code:4,
        res_msg:'获取总条数出错'
      })
    });
}
// 前端展示npm包
exports.ShowNPM = function(req, res, next){
  Npm.update({nid: req.body.nid}, {publish: req.body.publish})
		 .then((data)=>{
			 res.json({
			   res_code:1,
			   res_msg:'操作成功，请去页面查看'
			 })
		 })
		 .catch((err)=>{
			 console.log(err);
		 });
}
// 删除npm包
exports.RemoveNPM = function(req, res, next){
  Npm.remove({nid:req.body.nid})
	.then((data)=>{
		if(data&&data!=''){
			res.json({
			    res_code:1,
			    res_msg:'作品删除成功'
			})
		}else{
			res.json({
				res_code:2,
				res_msg:'作品不存在'
			})
		}
	})
	.catch((err)=>{
		console.log(err);
		res.json({
			res_code:4,
			res_msg:'作品删除出错'
		})
	});
}
