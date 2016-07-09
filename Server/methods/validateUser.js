'use strict';

const User = require('../api/users/models/User');

module.exports = (user, callback) => {
  User.count({_id: user}, (err, count) => {
    if (count > 0) {
      callback(true);
    }else {
      callback(false);
    }
  });
};
