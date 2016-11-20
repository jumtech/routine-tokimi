'use strict';

const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.CHANNEL_ACCESS_TOKEN});
const sender = new ReplySender(config);
var mode = "NORMAL";

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
  var replyMessages = [];

  // 現在のモードで分岐
  switch (mode) {
    case "NORMAL":
      // 通常モード：メッセージ内容に応じてモード変更
      const ADD = /登録|^と$/;
      const RUN = /やる/;
      const LIST = /みる|見る/;
      if (gotText.search(ADD) !== -1) {
        mode = "ADD";
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
      var RUNindex = gotText.search(RUN);
      if (RUNindex !== -1) {
        mode = "RUN";
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

      var LISTindex = gotText.search(LIST);
      if (LISTindex !== -1) {
        mode = "LIST";
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
      mode = "NORMAL";
      replyMessages = [
        {
          "type": "text",
          "text": "新しくルーチンを登録するには、「登録」とか「と」とか言ってね。"
        }
      ];
      return replyMessages;
    case "ADD":
      replyMessages = _makeADDMessages(gotText);
      return replyMessages;
    default:
      mode = "NORMAL";
      replyMessages = [
        {
          "type": "text",
          "text": "うーん、バグかな？困ったなあ。"
        }
      ];
      return replyMessages;
  }
};

function _makeADDMessages (gotText) {
  var replyMessages = [];
  if (gotText.includes("終了")) {
    replyMessages = [
      {
        "type": "text",
        "text": "新しいルーチンはこんな感じだよ！"
      },
      {
        "type": "text",
        "text": "ルーチン名：朝\n顔を洗う\n歯を磨く\n二度寝する"
      },
      {
        "type": "text",
        "text": "一緒に頑張ろうね！"
      }
    ];
    return replyMessages;
  }
  replyMessages = [
    {
      "type": "text",
      "text": "おっけー。まだタスクあったら、教えてー"
    }
  ];
  return replyMessages;
}
