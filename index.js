var express = require('express');
var app = express();
var request = require('request');

const headers = {
  "Content-Type" : "application/json; charset=UTF-8",
  "Authorization" : "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
};

const options = {
  "url" : "https://api.line.me/v2/bot/message/reply",
  "method" : "post",
  "headers": headers,
  "json": true,
  "payload": null
}

app.post('/callback', function(req, res, next) {
  var json = req.body;
  var events = json.events;
  events.forEach(function(event) {
    if (event.type == "follow") {
      var postData = {
        "replyToken" : event.replyToken,
        "messages" : [
          {
            "type" : "text",
            "text" : ((e.message.type=="text") ? e.message.text : "Text以外")
          }
        ]
      };
      options.payload = JSON.stringify(postData);
      request.post(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          console.log(body);
        } else {
          console.log('error: ' + JSON.stringify(res));
        }
      });
    } else if (event.type == "follow") {
      /* 友達追加・ブロック解除 */
    } else if (event.type == "unfollow") {
      /* ブロック */
    }
  });
});

app.get('/test', function(req, res) {
  res.send("TOKIMI is AWAKE");
});

app.listen(process.env.PORT || 3000);
console.log("server starting...");