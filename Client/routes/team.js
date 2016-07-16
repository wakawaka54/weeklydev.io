var express = require('express');
var request = require('request'); // HTTP request library
var router = express.Router();
var serverHost = require('../config').SERVER_HOST;

// authentication middleware
router.get('/*', function (req, res, next) {
  // protectPage automatically calls next.
  res.protectPage(req, res, next);
});

router.get('/', function (req, res, next) {
	res.render('pages/team');
});
