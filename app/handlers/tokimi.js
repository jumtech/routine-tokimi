'use strict';

const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.CHANNEL_ACCESS_TOKEN});
const sender = new ReplySender(config);

module.exports = function (req, res, next) {
  // Web hookへのリクエストに200を返す
  res.statusCode = 200;
  res.end();

  var events = req.body.events;
  events.forEach(function (event) {
    switch (event.type) {
      case "message":
        // ユーザーから送られたテキスト
        var gotText = "";
        // ユーザーに返すテキスト
        var replyMessages = [];
        if (event.message.type === "text") {
        // テキストが送られた場合
          gotText = event.message.text;
          replyMessages = _makeSendMessages(gotText);
          replyMessages.forEach(function (message) {
            console.log("reply:" + message.text);
          });
        } else {
        // スタンプ等が送られた場合
          replyMessages = [
            {
              "type": "text",
              "text": "ちょっと私には難しいなあ"
            }
          ];
          replyMessages.forEach(function (message) {
            console.log("reply:" + message.text);
          });
        }

        // メッセージを返信
        sender.send(event.replyToken, replyMessages);
        break;
      case "follow":
        /* 友達追加・ブロック解除 */
        break;
      case "unfollow":
        /* ブロック */
        break;
    }
  });
};

function _makeSendMessages (gotText) {
  const ADD = /登録|^と$/;
  const RUN = /やる/;
  const LIST = /みる|見る/;
  var replyMessages = [];

  // ルーチン登録
  if (gotText.search(ADD) !== -1) {
    replyMessages = [
      {
        "type": "text",
        "text": "新しく登録するルーチン名を入力してね。"
      },
      {
        "type": "text",
        "text": "短い方が覚えやすいから嬉しいな"
      }
    ];
    return replyMessages;
  }

  // ルーチン実行
  var RUNindex = gotText.search(RUN);
  if (RUNindex !== -1) {
    replyMessages = [
      {
        "type": "text",
        "text": gotText.substring(0, RUNindex) + "のルーチンを始めるんだね！"
      },
      {
        "type": "text",
        "text": "頑張ろう！"
      }
    ];
    return replyMessages;
  }

  // ルーチン確認
  var LISTindex = gotText.search(LIST);
  if (LISTindex !== -1) {
    replyMessages = [
      {
        "type": "text",
        "text": gotText.substring(0, LISTindex) + "のルーチンに登録されているタスクは、こんな感じだよー"
      },
      {
        "type": "text",
        "text": "頑張ろう！"
      }
    ];
    return replyMessages;
  }
  // default
  replyMessages = [
    {
      "type": "text",
      "text": "新しくルーチンを登録するには、「登録」とか「と」とか言ってね。"
    }
  ];
  return replyMessages;
};
