const express = require('express');
const app = express();

const request = require('request');
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan({ format: 'dev', immediate: true}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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
  console.log("receive POST...");
  var events = req.body.events;
  events.forEach(function(event) {
    console.log("forEach");
    if (event.type == "message") {
      var postData = {
        "replyToken" : event.replyToken,
        "messages" : [
          {
            "type" : "text",
            "text" : ((event.message.type=="text") ? event.message.text : "Text以外")
          }
        ]
      };
      console.log(event);
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
  res.statusCode = 200;
  res.end();
});

app.get('/test', function(req, res) {
  res.send("TOKIMI is AWAKE");
});

app.listen(process.env.PORT || 3000);
console.log("server starting...");