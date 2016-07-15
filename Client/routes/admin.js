var express = require('express');
var request = require('request'); // HTTP request library
var router = express.Router();

router.get('/', function (req, res, next) {
	res.render('pages/admin-dash', {username: req.session.user.username, token: req.session.user.token});
});

router.get('/users', function (req, res, next) {
	var url = 'http://localhost:1337/users?token=' + req.session.user.token;
	var users = '';

	request(url, function (err, response, body){
		if (!err && response.statusCode == 200){
			res.render('pages/admin-users', {token:req.session.user.token, users_list: body});
			console.log(body);
		}
	});
	
});




module.exports = router;