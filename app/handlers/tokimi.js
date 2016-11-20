'use strict';

const fs = require('fs');
const TextMessage = require('../models/TextMessage.js');
const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.CHANNEL_ACCESS_TOKEN});
const sender = new ReplySender(config);
var mode = "NORMAL";
var submode = "";

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
          replyMessages = _makeTextMessages([
            "ちょっと私には難しいなあ"
          ]);
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
    // 通常モード：メッセージ内容に応じてモード変更
    case "NORMAL":
      const ADD = /登録|^と$/;
      const RUN = /やる/;
      const LIST = /みる|見る/;
      // ルーチン登録へ
      if (gotText.search(ADD) !== -1) {
        mode = "ADD";
        submode = "INIT_ROUTINE";
        replyMessages = _makeTextMessages([
          "新しく登録するルーチン名を入力してね",
          "短い方が覚えやすいから嬉しいな"
        ]);
        return replyMessages;
      }
      // ルーチン実行へ
      var RUNindex = gotText.search(RUN);
      if (RUNindex !== -1) {
        mode = "RUN";
        let routineName = gotText.substring(0, RUNindex);
        replyMessages = _makeTextMessages([
          routineName + "のルーチンを始めるんだね！",
          "頑張ろう！"
        ]);
        return replyMessages;
      }
      // ルーチン確認へ
      var LISTindex = gotText.search(LIST);
      if (LISTindex !== -1) {
        mode = "LIST";
        let routineName = gotText.substring(0, LISTindex);
        replyMessages = _makeTextMessages([
          routineName + "のルーチンに登録されているタスクは、こんな感じだよー",
          "頑張ろう！"
        ]);
        return replyMessages;
      }
      // default
      mode = "NORMAL";
      replyMessages = _makeTextMessages([
        "新しくルーチンを登録するには、「登録」とか「と」とか言ってね。"
      ]);
      return replyMessages;

    // ルーチン追加モード
    case "ADD":
      if (gotText.includes("終了")) {
        mode = "NORMAL";
        submode = "FIN";
      }
      replyMessages = _reactInADDMode(gotText, replyMessages);
      return replyMessages;

    default:
      mode = "NORMAL";
      replyMessages = _makeTextMessages([
        "うーん、バグかな？困ったなあ。"
      ]);
      return replyMessages;
  }
};

function _reactInADDMode (gotText, replyMessages) {
  switch (submode) {
    case "INIT_ROUTINE":
      _initRoutine(gotText);
      replyMessages = _makeTextMessages([
        "「" + gotText + "」のルーチンを登録するよ",
        "順番に、タスクの名前を教えてね",
        "私の台詞っぽく書くと、会話が自然になるよ",
        "何ごとも、協力が大切だよねー"
      ]);
      submode = "ADD_TASK";
      break;
    case "ADD_TASK":
      _addTask(gotText);
      replyMessages = _makeTextMessages([
        "おっけー。まだタスクあったら、教えてー"
      ]);
      submode = "ADD_TASK";
      break;
    case "FIN":
      let texts = [];
      texts = texts.concat(
        ["新しいルーチンはこんな感じだよ！"],
        _getRoutineTexts(),
        ["以上！一緒に頑張ろうね！"]
      );
      replyMessages = _makeTextMessages(texts);
      break;
    default:
      replyMessages = _makeTextMessages([
        "これは...バグだ！！！"
      ]);
  }
  return replyMessages;
}

function _initRoutine (routineName) {
  var data = {
    routine: {
      name: routineName,
      tasks: []
    }
  };
  fs.writeFileSync("../../tokimiDB.json", JSON.stringify(data));
}
function _addTask (taskName) {
  var data = JSON.parse(fs.readFileSync("../../tokimiDB.json", "utf8"));
  var routine = data.routine;
  var tasks = routine.tasks;
  var task = {
    name: taskName
  };
  tasks.push(task);
  routine.tasks = tasks;
  data.routine = routine;
  fs.writeFileSync("../../tokimiDB.json", JSON.stringify(data));
}
function _getRoutineTexts () {
  var data = JSON.parse(fs.readFileSync("../../tokimiDB.json", "utf8"));
  var routine = data.routine;
  var tasks = routine.tasks;
  var texts = [];
  texts.push("ルーチン名：" + routine.name);
  tasks.forEach(function (task) {
    texts.push("「" + task.name + "」");
  });
  return texts;
}
function _makeTextMessages (textArr) {
  var messages = [];
  var data = {};
  var message = "";
  textArr.forEach(function (text) {
    data = {
      type: "text",
      text: text
    };
    message = new TextMessage(data);
    messages.push(message);
  });
  return messages;
}
