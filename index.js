const express = require('express');
const app = express();

const request = require('request');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const hkdnetHandler = require('./app/handlers/hkdnet.js');

app.use(morgan("dev", {immediate: true}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post('/callback', function(req, res, next) {
  var events = req.body.events;
  events.forEach(function(event) {
    switch (event.type) {
      case "message":
      // ユーザーから送られたテキスト
      var gotText = "";
      // ユーザーに返す
      var replyText = "";
        if (event.message.type = "text") {
        // テキストが送られた場合
          gotText = event.message.text;
          replyText = _getSendText(gotText);
          console.log("replyText:" + replyText);
        } else {
        // スタンプ等が送られた場合
          replyText = "ちょっと難しいなあ";
        }
        var gotText = event.message.text;
        var postData = {
          "replyToken" : event.replyToken,
          "messages" : [
            {
              "type" : "text",
              "text" : replyText
            }
          ]
        };
        var options = {
          url: "https://api.line.me/v2/bot/message/reply",
          headers: {
            "Content-Type" : "application/json; charset=UTF-8",
            "Authorization" : "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
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
        break;
      case "follow":
        /* 友達追加・ブロック解除 */
        break;
      case "unfollow":
        /* ブロック */
        break;
    }
  });
  // Web hookへのリクエストに200を返す
  res.statusCode = 200;
  res.end();
  next();
});

_getSendText = function(gotText) {
  var replyText = "ん？バグかな？";
  if (gotText.includes("登録")) {
    replyText = "新しく登録するルーチン名を入力してね。短い方が覚えやすいから嬉しいな";
  } else if (gotText.includes("やる")) {
    replyText = "ルーチンを始めるんだね！頑張ろう！";
  } else if (gotText.includes("みる")) {
    replyText = "ルーチンに登録されているタスクは、こんな感じだよー";
  } else {
    replyText = "よくわからんちー";
  }
  return replyText;
};

app.get('/test', function(req, res) {
  res.send("TOKIMI is AWAKE");
});

app.post('/hkdnet', hkdnetHandler);
app.listen(process.env.PORT || 3000);
console.log("server starting...");
