var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render("users", { title: '注册登录页' });
    // res.send('user page');
});

router.route('/logout').get(function(req, res) {
    // res.redirect("/home");
    res.send('logout')
    req.session.user = null;
    req.session.error = null;
    res.redirect(301, "/");
})

router.route('/login/home').get(function(req, res) {
    // if (!req.session.user) { //到达/home路径首先判断是否已经登录
    //     req.session.error = "请先登录"
    //     res.redirect(301, "/users/login"); //未登录则重定向到 /login 路径
    // }
    res.render("home", { title: 'Home' }); //已登录则渲染home页面
})

router.route("/login").get(function(req, res) { // 到达此路径则渲染login文件，并传出title值供 login.html使用
    // res.send('this is login page');
    res.render("login", { title: '登录页' });
}).post(function(req, res) { // 从此路径检测到post方式则进行post数据的处理操作

    //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    var User = global.dbHandel.getModel('user');
    var uname = req.body.uname; //获取post上来的 data数据中 uname的值
    User.findOne({ name: uname }, function(err, doc) { //通过此model以用户名的条件 查询数据库中的匹配信息
        if (err) { //错误就返回给原post处（login.html) 状态码为500的错误
            res.send(500);
            console.log(err);
        } else if (!doc) { //查询不到用户名匹配信息，则用户名不存在
            req.session.error = '用户名不存在';
            res.send(404); //	状态码返回404
            //	res.redirect("/login");
        } else {
            if (req.body.upwd != doc.password) { //查询到匹配用户名的信息，但相应的password属性不匹配
                req.session.error = "密码错误";
                res.send(404);
                //	res.redirect("/login");
            } else { //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                req.session.user = doc;
                res.send(200);

                // res.redirect("/login/home");
            }
        }
    });
});

// router.route('/register').get(function(req, res, next) {
//     res.send('暂未开放注册功能');
// })
router.route('/register').get(function(req, res, next) {
    res.render("register1", { title: '注册页' });
    // res.send('this is register page')
}).post(function(req, res, next) {
    //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    var User = global.dbHandel.getModel('user');
    var uname = req.body.uname;
    var upwd = req.body.upwd;

    // 下面的  req.session.xxx  将在 页面显示
    User.findOne({ name: uname }, function(err, doc) { // 同理 /login 路径的处理方式
        if (err) {
            res.send(500);
            req.session.error = '网络异常错误！';
            console.log(err);
        } else if (doc) {
            req.session.error = '用户名已存在！';
            res.send(500);
        } else {
            User.create({ // 创建一组user对象置入model
                name: uname,
                password: upwd
            }, function(err, doc) {
                if (err) {
                    res.send(500);
                    console.log(err);
                } else {
                    req.session.error = '用户名创建成功！';
                    res.send(200);
                }
            });
        }
    });
})


module.exports = router;