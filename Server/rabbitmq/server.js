'use strict';
const amqp = require('amqplib/callback_api');
const User = require('../api/users/models/User');
// Jobs queue
amqp.connect('amqp://192.168.99.100', function (err, conn) {
  conn.createChannel(function (err, ch) {
    var q = 'task_queue';
    for (var i = 0; i < 20; i++) {
      let msg = '' + i;
      ch.assertQueue(q, {durable: true});
      ch.sendToQueue(q, new Buffer(msg), {persistent: true});
      console.log(" [x] Sent '%s'", msg);
    }
  });
  setTimeout(function () { conn.close(); process.exit(0); }, 500);
});
