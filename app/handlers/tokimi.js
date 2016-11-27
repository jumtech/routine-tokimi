'use strict';

const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.CHANNEL_ACCESS_TOKEN});
const sender = new ReplySender(config);
const db = require('../../models/index.js');
const Task = db.task;
const Routine = db.routine;
const uuid = require('node-uuid');

var mode = "NORMAL";
var submode = "";
var current_routine_name = "";
var current_task_id = "";

module.exports = function (req, res, next) {
  // Web hookへのリクエストに200を返す
  res.statusCode = 200;
  res.end();

  var events = req.body.events;
  events.forEach(function (event) {
    let userId = event.source.userId;
    switch (event.type) {
      case "message":
        // ユーザーから送られたテキスト
        var gotText = "";
        // ユーザーに返すテキスト
        var replyMessages = [];
        if (event.message.type === "text") {
        // テキストが送られた場合
          gotText = event.message.text;
          replyMessages = _makeSendMessages(userId, gotText);
        } else {
        // スタンプ等が送られた場合
          replyMessages = _makeTextMessages([
            "ちょっと私には難しいなあ"
          ]);
        }
        // ログ出力：送信メッセージ
        replyMessages.forEach(function (message) {
          console.log("replyMessage.type:" + message.type);
          console.log("replyMessage.text:" + message.text);
        });
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

function _makeSendMessages (userId, gotText) {
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
      replyMessages = _reactInADDMode(userId, gotText, replyMessages);
      return replyMessages;

    default:
      mode = "NORMAL";
      replyMessages = _makeTextMessages([
        "うーん、バグかな？困ったなあ。"
      ]);
      return replyMessages;
  }
};

function _reactInADDMode (userId, gotText, replyMessages) {
  switch (submode) {
    case "INIT_ROUTINE":
      _insertRoutine(userId, gotText);
      current_routine_name = gotText;
      replyMessages = _makeTextMessages([
        "「" + gotText + "」のルーチンを登録するよ",
        "順番に、タスクの名前を教えてね",
        "私の台詞っぽく書くと、会話が自然になるよ",
        "何ごとも、協力が大切だよねー"
      ]);
      submode = "ADD_FIRST_TASK";
      break;
    case "ADD_FIRST_TASK":
      var taskId = uuid.v1();
      let routineName = current_routine_name;
      _updateRoutineWithFirst_task_id(userId, routineName, taskId);
      _insertTask(userId, taskId, gotText);
      replyMessages = _makeTextMessages([
        "おっけー。まだタスクあったら、教えてー"
      ]);
      current_task_id = taskId;
      submode = "ADD_TASK";
      break;
    case "ADD_TASK":
      var taskId = uuid.v1();
      _insertTask(userId, taskId, gotText);
      replyMessages = _makeTextMessages([
        "おっけー。まだタスクあったら、教えてー"
      ]);
      let previousTaskId = current_task_id;
      _updateTaskWithNext_task_id(userId, previousTaskId, taskId);
      current_task_id = taskId;
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

function _insertRoutine (userId, routineName) {
  let routine = Routine.build({user_id: userId, routine_name: routineName, first_task_id: null});
  return routine.save().catch(err => {
    console.error(err);
    return Promise.reject(err);
  });
}

function _updateRoutineWithFirst_task_id (userId, routineName, taskId) {
  return Routine.update({
    first_task_id: taskId
  }, {
    where: {
      user_id: userId,
      routine_name: routineName
    }
  }).catch(err => {
    console.error(err);
    return Promise.reject(err);
  });
}

function _insertTask (userId, taskId, taskName) {
  let task = Task.build({user_id: userId, task_id: taskId, task_name: taskName, next_task_id: null});
  return task.save().catch(err => {
    console.error(err);
    return Promise.reject(err);
  });
}

function _updateTaskWithNext_task_id (userId, previousTaskId, nextTaskId) {
  return Task.update({
    next_task_id: nextTaskId
  },{
    where: {
      user_id: userId,
      task_id: previousTaskId
    }
  }).catch(err => {
    console.error(err);
    return Promise.reject(err);
  });
}

function _getRoutineTexts () {
  var texts = [];
  texts.push("ルーチン名：" + "朝");
  texts.push("「顔を洗おう」");
  texts.push("「歯も磨いたら？」");
  texts.push("「二度寝しちゃおう！」");
  return texts;
}
function _makeTextMessages (textArr) {
  var messages = [];
  var message = {};
  textArr.forEach(function (text) {
    message = {
      type: "text",
      text: text
    };
    messages.push(message);
  });
  return messages;
}
