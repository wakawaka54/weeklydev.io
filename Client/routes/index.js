var express = require('express');
// var request = require('request'); // HTTP request library
var router = express.Router();

// GET
router.get('/', function (req, res, next) {
	//res.protectPage(req, res, next);
	if (res.locals.auth){
		res.render('pages/index');
	} else {
		res.redirect('/auth/login');
	}
});

module.exports = router;
