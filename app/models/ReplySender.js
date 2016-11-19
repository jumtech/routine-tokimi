'use strict';

const request = require('request');

class ReplySender {
  construtor(config) {
    this.config = config;
  }

  send(replyToken, messages) {
    var postData = {
      "replyToken" : replyToken,
      "messages" : messages,
    };

    var options = {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: {
        "Content-Type" : "application/json; charset=UTF-8",
        "Authorization" : "Bearer " + this.config.token
      },
      json: true,
      body: postData
    };
    request.post(options, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log(body);
      } else {
        console.log('error: ' + JSON.stringify(res));
      }
    });
  }
}

module.exports = ReplySender;
