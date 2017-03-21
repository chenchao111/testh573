var express = require('express');
var router = express.Router();

var articleModel = require('../mongodb/db').articleModel;

//引入markdown模块
var markdown = require('markdown').markdown;

/* GET home page. */
router.get('/', function (req, res, next) {
    //读取数据库中所有文章列表的信息

    //  /
    //  /?keyword='足球';
    var query = {};//到数据库中查找文章的条件

    var keyword = req.query.keyword;//搜索提交的关键字
    if (keyword){ //提交搜索的表单
        req.session.keyword = keyword; //将搜索关键字保存到session中
         //文章  标题或者内容包含keyword关键字即可
        var reg = new RegExp(keyword, 'i');//创建正则
        query = {$or: [{title: reg}, {content: reg}]};
    }


    articleModel.find(query)
        .populate('user')
        .exec(function (err, articles) {
            if (!err) {
                req.flash('success', '获取文章列表信息成功');

                articles.forEach(function (article, index) {
                    article.content = markdown.toHTML(article.content);//让所有文章的内容支持markdown
                });

                res.render('index', {
                    title: '首页标题',
                    articles: articles,
                    keyword: keyword //渲染模版引擎文件
                });
            } else {
                req.flash('error', '获取文章列表信息失败');
                res.redirect('back');
            }
        });
});

module.exports = router;
