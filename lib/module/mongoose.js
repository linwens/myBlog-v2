var mongoose = require('../linkMongo');
var Schema = mongoose.Schema;
//用户存储
var userSchema = new Schema({
	username: String,
    password: String
});
exports.User = mongoose.model('users', userSchema);
//文章存储
var articlesSchema = new Schema({
	time: String,
    title: String,
    text:String,
    tags:Array,
    aid:String,
    brief:String,
    operate:String,
    pv:Number
});
exports.Articles = mongoose.model('articles', articlesSchema);
//图片操作
var ImgSchema = new Schema({
	time: String,
  title: String,
  desc: String,
  theme: String,
  size: String,
  url:String,
  exif:Object,
  type:String,
  gid:String
});
exports.Img = mongoose.model('Img', ImgSchema);
//npm包存储
var NpmSchema = new Schema({
  time: String,
  name: String,
  desc: String,
  publish: Number,
  nid: String
});
exports.Npm = mongoose.model('NPM', NpmSchema);
//H5作品存储
var H5Schema = new Schema({
    time: String,
    name: String,
    desc:String,
    hid:String
});
exports.Html5 = mongoose.model('html5', H5Schema);