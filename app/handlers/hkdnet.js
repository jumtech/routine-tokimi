'use strict';

const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.HKDNET_TOKEN});
const sender = new ReplySender(config);

module.exports = function (req, res, next) {
  res.statusCode = 200;
  res.end();
  console.log("Start processing...");
  console.log("body: " + JSON.stringify(req.body));
  var events = req.body && req.body.events;
  if (!events || !events.forEach) {
    console.error("Invalid request!");
    return;
  }
  events.forEach(function (event) {
    console.log("event: " + JSON.stringify(event));
    if (event.type === "message") {
      var messages = [
        {
          "type": "text",
          "text": ((event.message.type === "text") ? event.message.text : "Text以外")
        }
      ];
      sender.send(event.replyToken, messages);
    } else if (event.type === "follow") {
      /* 友達追加・ブロック解除 */
    } else if (event.type === "unfollow") {
      /* ブロック */
    }
  });
};
