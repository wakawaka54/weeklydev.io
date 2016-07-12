var express = require('express');
var request = require('request'); // HTTP request library
var router = express.Router();
var serverHost = require('../config').SERVER_HOST;

// authentication middleware
router.get('/*', function (req, res, next) {
  // protectPage automatically calls next.
  res.protectPage(req, res, next);
});

// GET
router.get('/', function (req, res, next) {
  res.render('pages/account', {username: req.session.user.username});
});

router.get('/settings', function (req, res, next) {
  var requestOptions = {
    url: serverHost + '/survey',
    headers: {
      'Authorization': 'bearer' + req.session.user.token
    }
  };

  request.get(requestOptions, function (error, response, body) {
    if (error) {
      console.log('/account/settings error - ' + error.Error);
      res.render('pages/account-settings', {error: "Couldn't connect to the database. Please contact a system administrator."});
      return;
    }

    var jsonBody = JSON.parse(body);
    jsonBody.submitted = true;

    if (jsonBody.error) {
      console.log('/account/settings error - ' + jsonBody.message);
      res.render('pages/account-settings', { error: jsonBody.message });
      return;
    }

    res.render('pages/account-settings', jsonBody);
  });

  

});

// POST
router.post('/settings', function (req, res, next) {
  var role = req.body.role;
  var skill = Number(req.body.skill);
  var projectSize = Number(req.body.size);
  var timezone = Number(req.body.timezone);
  var isProjectManager = (req.body.projectmanager && req.body.projectmanager === 'true');
  var submitted = (req.body.submitted);

  // API HTTP request options
  var requestOptions = {
    url: serverHost + '/survey',
    headers: {
      'Authorization': 'bearer ' + req.session.user.token
    },
    form: {
      'role[0]': role,
      skill: skill,
      size: projectSize,
      projectManager: isProjectManager,
      timezone: timezone
    }
  };

  if (submitted) {
    requestOptions.method = 'PUT';
  }
  else {
    requestOptions.method = 'POST';
  }

  // send request to API
  request(requestOptions, function (error, response, body) {
    // if there are database errors, send an error message.
    if (error) {
      console.log('/account/settings error - ' + error.Error);
      res.render('pages/account-settings', {error: "Couldn't connect to the database. Please contact a system administrator."});
      return;
    }

    // parse body for easier value retrieval.
    var jsonBody = JSON.parse(body);

    // if we got an error from the API, log that message.
    if (jsonBody.error) {
      console.log('/account/settings error - ' + jsonBody.message);
      res.render('pages/account-settings', { error: jsonBody.message });
      return;
    }

    // Settings update was successful.
    res.redirect('/account/settings');
  });
});


module.exports = router;