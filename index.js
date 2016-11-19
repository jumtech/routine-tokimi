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
  // Web hookへのリクエストに200を返す
  res.statusCode = 200;
  res.end();

  var events = req.body.events;
  events.forEach(function(event) {
    switch (event.type) {
      case "message":
      // ユーザーから送られたテキスト
      var gotText = "";
      // ユーザーに返すテキスト
      var replyText = "";
        if (event.message.type === "text") {
        // テキストが送られた場合
          gotText = event.message.text;
          replyText = _getSendText(gotText);
          console.log("replyText:" + replyText);
        } else {
        // スタンプ等が送られた場合
          replyText = "ちょっと私には難しいなあ";
          console.log("replyText:" + replyText);
        }
        gotText = event.message.text;
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
});

_getSendText = function(gotText) {
  const ADD = /登録|^と$/;
  const RUN = /やる/;
  const LIST = /みる|見る/;

  var replyText = "ん？バグかな？";
  
  // ルーチン登録
  if (gotText.search(ADD) !== -1) {
    replyText = "新しく登録するルーチン名を入力してね。短い方が覚えやすいから嬉しいな";
    return replyText;
  }

  // ルーチン実行
  var RUNindex = gotText.search(RUN);
  if (RUNindex !== -1) {
    replyText = gotText.substring(0, RUNindex) + "のルーチンを始めるんだね！頑張ろう！";
    return replyText;
  }

  // ルーチン確認
  var LISTindex = gotText.search(LIST);
  if (LISTindex !== -1) {
    replyText = gotText.substring(0, LISTindex) + "のルーチンに登録されているタスクは、こんな感じだよー";
    return replyText;
  }
  replyText = "新しくルーチンを登録するには、「登録」とか「と」とか言ってね。";
  return replyText;
};

app.get('/test', function(req, res) {
  res.send("TOKIMI is AWAKE");
});

app.post('/hkdnet', hkdnetHandler);
app.listen(process.env.PORT || 3000);
console.log("server starting...");
