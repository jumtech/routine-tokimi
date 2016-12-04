'use strict';

const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.CHANNEL_ACCESS_TOKEN});
const sender = new ReplySender(config);
const db = require('../../models/index.js');
const Task = db.task;
const Routine = db.routine;
const uuid = require('node-uuid');

let mode = "NORMAL";
let submode = "";
let DBcurrentRoutineName = "";
let DBcurrentTaskId = "";

module.exports = function (req, res, next) {
  // Web hookへのリクエストに200を返す
  res.statusCode = 200;
  res.end();

  let events = req.body.events;
  events.forEach(event => {
    let userId = event.source.userId;
    switch (event.type) {
      case "message":
        if (event.message.type === "text") {
        // テキストが送られた場合
          _replyToMessage(userId, event.replyToken, event.message.text);
        } else {
        // スタンプ等が送られた場合
          _replyToSticker(userId, event.replyToken);
        }
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

function _replyToMessage (userId, replyToken, gotText) {
  _makeSendMessages(userId, gotText)
    .then(messages => {
      messages.forEach(message => {
        console.log("@@@replyMessages.text:" + message.text);
      });
      sender.send(replyToken, messages);
    })
    .catch(err => {
      console.log(err);
    });
}

function _replyToSticker (userId, replyToken) {
  let messages = _makeTextMessages([
    "ちょっと私には難しいなあ"
  ]);
  sender.send(replyToken, messages);
}

function _makeSendMessages (userId, gotText) {
  return new Promise((resolve, reject) => {
    let replyMessages = [];
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
          resolve(replyMessages);
          return;
        }
        // ルーチン実行へ
        let RUNindex = gotText.search(RUN);
        if (RUNindex !== -1) {
          mode = "RUN";
          let routineName = gotText.substring(0, RUNindex);
          replyMessages = _makeTextMessages([
            routineName + "のルーチンを始めるんだね！",
            "頑張ろう！"
          ]);
          resolve(replyMessages);
          return;
        }
        // ルーチン確認へ
        let LISTindex = gotText.search(LIST);
        if (LISTindex !== -1) {
          mode = "LIST";
          let routineName = gotText.substring(0, LISTindex);
          replyMessages = _makeTextMessages([
            routineName + "のルーチンに登録されているタスクは、こんな感じだよー",
            "頑張ろう！"
          ]);
          resolve(replyMessages);
          return;
        }
        // default
        mode = "NORMAL";
        replyMessages = _makeTextMessages([
          "新しくルーチンを登録するには、「登録」とか「と」とか言ってね。"
        ]);
        resolve(replyMessages);
        break;
      // ルーチン追加モード
      case "ADD":
        if (gotText.includes("終了")) {
          mode = "NORMAL";
          submode = "FIN";
        }
        _getReplyMessagesInADDMode(userId, gotText, replyMessages)
          .then(messages => {
            resolve(messages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      default:
        mode = "NORMAL";
        replyMessages = _makeTextMessages([
          "うーん、バグかな？困ったなあ。"
        ]);
        resolve(replyMessages);
    }
  });
}

function _getReplyMessagesInADDMode (userId, gotText, replyMessages) {
  return new Promise((resolve, reject) => {
    let currentRoutineName = DBcurrentRoutineName;
    let currentTaskId = DBcurrentTaskId;
    switch (submode) {
      case "INIT_ROUTINE":
        _insertRoutine(userId, gotText)
          .then(() => {
            DBcurrentRoutineName = gotText;
            replyMessages = _makeTextMessages([
              "「" + gotText + "」のルーチンを登録するよ",
              "順番に、タスクの名前を教えてね",
              "私の台詞っぽく書くと、会話が自然になるよ",
              "何ごとも、協力が大切だよねー"
            ]);
            submode = "ADD_FIRST_TASK";
            resolve(replyMessages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      case "ADD_FIRST_TASK":
        let firstTaskId = uuid.v1();
        _updateRoutineWithFirstTaskId(userId, currentRoutineName, firstTaskId)
          .then(() => _insertTask(userId, firstTaskId, gotText))
          .then(() => {
            replyMessages = _makeTextMessages([
              "おっけー。まだタスクあったら、教えてー"
            ]);
            DBcurrentTaskId = firstTaskId;
            submode = "ADD_TASK";
            resolve(replyMessages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      case "ADD_TASK":
        let taskId = uuid.v1();
        _insertTask(userId, taskId, gotText)
          .then(() => _updateTaskWithNextTaskId(userId, currentTaskId, taskId))
          .then(() => {
            replyMessages = _makeTextMessages([
              "おっけー。まだタスクあったら、教えてー"
            ]);
            DBcurrentTaskId = taskId;
            submode = "ADD_TASK";
            resolve(replyMessages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      case "FIN":
        let texts = [];
        _fetchRoutineTexts(userId, currentRoutineName)
          .then(routineTexts => {
            texts = texts.concat(
              ["新しいルーチンはこんな感じだよ！"],
              routineTexts,
              ["以上！一緒に頑張ろうね！"]
            );
            replyMessages = _makeTextMessages(texts);
            resolve(replyMessages);
          })
          .catch(err => Promise.reject(err));
        break;
      default:
        replyMessages = _makeTextMessages([
          "これは...バグだ！！！"
        ]);
        resolve(replyMessages);
    }
  });
}

function _insertRoutine (userId, routineName) {
  let routine = Routine.build({user_id: userId, routine_name: routineName, first_task_id: null});
  return routine.save().catch(err => {
    return Promise.reject(err);
  });
}

function _updateRoutineWithFirstTaskId (userId, routineName, taskId) {
  return Routine.update({
    first_task_id: taskId
  }, {
    where: {
      user_id: userId,
      routine_name: routineName
    }
  }).catch(err => {
    return Promise.reject(err);
  });
}

function _insertTask (userId, taskId, taskName) {
  let task = Task.build({user_id: userId, task_id: taskId, task_name: taskName, next_task_id: null});
  return task.save().catch(err => {
    return Promise.reject(err);
  });
}

function _updateTaskWithNextTaskId (userId, previousTaskId, nextTaskId) {
  return Task.update({
    next_task_id: nextTaskId
  }, {
    where: {
      user_id: userId,
      task_id: previousTaskId
    }
  }).catch(err => {
    return Promise.reject(err);
  });
}

function _fetchRoutineTexts (userId, routineName) {
  return new Promise((resolve, reject) => {
    let texts = [];
    _findRoutine(userId, routineName)
      .then(routine => {
        console.log("routine.routine_name: " + routine.routine_name);
        let nextTaskId = routine.first_task_id;
        texts.push("ルーチン名：" + routineName);
        return _findTask(userId, nextTaskId);
      })
      .then(task => {
        console.log("task.task_name: " + task.task_name);
        texts.push("「" + task.task_name + "」");
        resolve(texts);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function _findRoutine (userId, routineName) {
  return Routine.findOne({
    where: {
      user_id: userId,
      routine_name: routineName
    }
  });
}

function _findTask (userId, taskId) {
  return Task.findOne({
    where: {
      user_id: userId,
      task_id: taskId
    }
  });
}

function _makeTextMessages (textArr) {
  let messages = [];
  let message = {};
  textArr.forEach(text => {
    message = {
      type: "text",
      text: text
    };
    messages.push(message);
  });
  return messages;
}
