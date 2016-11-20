'use strict';

const request = require('request');

class ReplySender {
  constructor (config) {
    this.config = config;
  }

  get baseOption () {
    return {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + this.config.token
      },
      json: true
    };
  }

  send (replyToken, messages) {
    var postData = {
      "replyToken": replyToken,
      "messages": messages
    };

    var options = Object.assign({}, this.baseOption, {
      body: postData
    });
    console.log("START send: ", JSON.stringify(options));
    request.post(options, function (err, res, body) {
      console.log("END send");
      if (!err && res.statusCode === 200) {
        console.log("success", body);
      } else {
        console.log('error: ' + JSON.stringify(res));
      }
    });
  }
}

module.exports = ReplySender;
