'use strict';

const ReplySender = require('../models/ReplySender.js');
const ReplySenderConfig = require('../models/ReplySenderConfig.js');
const config = new ReplySenderConfig({token: process.env.CHANNEL_ACCESS_TOKEN});
const sender = new ReplySender(config);
const db = require('../../models/index.js');
const Task = db.task;
const Routine = db.routine;

const ADD_RGX = /登録|^と$/;
const RUN_RGX = /やる/;
const LIST_RGX = /みる|見る/;

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
    let replyToken = event.replyToken;
    switch (event.type) {
      case "message":
        if (event.message.type === "text") {
        // テキストが送られた場合
          _replyToMessage(userId, replyToken, event.message.text);
        } else {
        // スタンプ等が送られた場合
          _replyToNotMessage(userId, replyToken);
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
  _makeReplyMessages(userId, gotText)
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

function _replyToNotMessage (userId, replyToken) {
  let messages = _makeTextMessages([
    "ちょっと私には難しいなあ"
  ]);
  sender.send(replyToken, messages);
}

function _makeReplyMessages (userId, gotText) {
  return new Promise((resolve, reject) => {
    let replyMessages = [];
    // 現在のモードで分岐
    switch (mode) {
      // 通常モード：メッセージ内容に応じてモード変更
      case "NORMAL":
        _makeReplyMessagesInNormalMode(gotText)
          .then(messages => {
            resolve(messages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      // ルーチン追加モード
      case "ADD":
        if (gotText.includes("終了")) {
          mode = "NORMAL";
          submode = "FIN";
        }
        _makeReplyMessagesInADDMode(userId, gotText, replyMessages)
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
function _makeReplyMessagesInNormalMode (gotText) {
  return new Promise((resolve, reject) => {
    // ルーチン登録へ
    if (gotText.search(ADD_RGX) !== -1) {
      _makeReplyMessagesWhenInitRoutine()
        .then(messages => {
          resolve(messages);
        });
      return;
    }
    // ルーチン実行へ
    let RUNIndex = gotText.search(RUN_RGX);
    if (RUNIndex !== -1) {
      _makeReplyMessagesWhenStartRun(gotText, RUNIndex)
        .then(messages => {
          resolve(messages);
        });
      return;
    }
    // ルーチン確認へ
    let LISTIndex = gotText.search(LIST_RGX);
    if (LISTIndex !== -1) {
      _makeReplyMessagesWhenList(gotText, LISTIndex)
        .then(messages => {
          resolve(messages);
        });
      return;
    }
    // default
    _makeReplyMessagesWhenDefault()
      .then(messages => {
        resolve(messages);
      });
    return;
  });
}
function _makeReplyMessagesWhenInitRoutine () {
  mode = "ADD";
  submode = "INIT_ROUTINE";
  let replyMessages = _makeTextMessages([
    "新しく登録するルーチン名を入力してね",
    "短い方が覚えやすいから嬉しいな"
  ]);
  return Promise.resolve(replyMessages);
}
function _makeReplyMessagesWhenStartRun (gotText, RUNIndex) {
  mode = "RUN";
  submode = "START_RUN";
  let routineName = gotText.substring(0, RUNIndex);
  let replyMessages = _makeTextMessages([
    routineName + "のルーチンを始めるんだね！",
    "頑張ろう！"
  ]);
  return Promise.resolve(replyMessages);
}
function _makeReplyMessagesWhenList (gotText, LISTIndex) {
  mode = "LIST";
  let routineName = gotText.substring(0, LISTIndex);
  let replyMessages = _makeTextMessages([
    routineName + "のルーチンに登録されているタスクは、こんな感じだよー",
    "頑張ろう！"
  ]);
  return Promise.resolve(replyMessages);
}
function _makeReplyMessagesWhenDefault () {
  let replyMessages = _makeTextMessages([
    "新しくルーチンを登録するには、「登録」とか「と」とか言ってね。"
  ]);
  return Promise.resolve(replyMessages);
}

function _makeReplyMessagesInADDMode (userId, gotText, replyMessages) {
  return new Promise((resolve, reject) => {
    let currentRoutineName = null;
    let currentTaskId = null;
    switch (submode) {
      case "INIT_ROUTINE":
        _insertRoutine(userId, gotText)
          .then(() => _makeReplyMessagesAfterInsertRoutine(gotText))
          .then((messages) => {
            resolve(messages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      case "ADD_FIRST_TASK":
        currentRoutineName = DBcurrentRoutineName;
        _insertTask(userId, gotText)
          .then((task) => {
            DBcurrentTaskId = task.id;
            return _updateRoutineWithFirstTaskId(userId, currentRoutineName, task.id);
          })
          .then(() => {
            replyMessages = _makeTextMessages([
              "おっけー。まだタスクあったら、教えてー"
            ]);
            submode = "ADD_NEXT_TASK";
            resolve(replyMessages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      case "ADD_NEXT_TASK":
        currentTaskId = DBcurrentTaskId;
        _insertTask(userId, gotText)
          .then((task) => {
            DBcurrentTaskId = task.id;
            return _updateTaskWithNextTaskId(currentTaskId, task.id)
          })
          .then(() => {
            replyMessages = _makeTextMessages([
              "おっけー。まだタスクあったら、教えてー"
            ]);
            submode = "ADD_NEXT_TASK";
            resolve(replyMessages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      case "FIN":
        currentRoutineName = DBcurrentRoutineName;
        _makeReplyMessagesWhenFinishAdd(userId, currentRoutineName)
          .then(messages => {
            resolve(messages);
          })
          .catch(err => {
            reject(err);
          });
        break;
      default:
        replyMessages = _makeTextMessages([
          "これは...バグだ！！！"
        ]);
        resolve(replyMessages);
    }
  });
}

function _makeReplyMessagesAfterInsertRoutine (gotText) {
  DBcurrentRoutineName = gotText;
  let replyMessages = _makeTextMessages([
    "「" + gotText + "」のルーチンを登録するよ",
    "順番に、タスクの名前を教えてね",
    "私の台詞っぽく書くと、会話が自然になるよ",
    "何ごとも、協力が大切だよねー"
  ]);
  submode = "ADD_FIRST_TASK";
  return Promise.resolve(replyMessages);
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

function _insertTask (userId, taskName) {
  return new Promise((resolve, reject) => {
    let task = Task.build({user_id: userId, task_name: taskName, next_task_id: null});
    task.save()
      .then(task => {
        resolve(task);
      })
      .catch(err => {
        reject(err);
      });
  })
}

function _updateTaskWithNextTaskId (currentTaskId, nextTaskId) {
  return new Promise((resolve, reject) => {
    Task.update({
      next_task_id: nextTaskId
    }, {
      where: {
        id: currentTaskId
      }
    })
    .then(task => {
      resolve(task);
    })
    .catch(err => {
      reject(err);
    });
  })
}

function _makeReplyMessagesWhenFinishAdd (userId, routineName) {
  return new Promise((resolve, reject) => {
    let texts = [];
    let routineText = "";
    _findRoutine(userId, routineName)
      .then(routine => {
        routineText += "ルーチン名：" + routineName;
        let firstTaskId = routine.first_task_id;
        return _findTasksByFirstTaskId(firstTaskId);
      })
      .then(tasks => {
        tasks.forEach(task => {
          routineText += "\n「" + task.task_name + "」";
        });
        texts = [].concat(
          ["新しいルーチンはこんな感じだよ！"],
          [routineText],
          ["以上！一緒に頑張ろうね！"]
        );
        let replyMessages = _makeTextMessages(texts);
        resolve(replyMessages);
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

function _findTaskById (taskId) {
  return Task.findOne({
    where: {
      id: taskId
    }
  });
}

function _findTasksByFirstTaskId (firstTaskId) {
  return new Promise((resolve, reject) => {
    let tasks = [];
    _loop(_findTaskById(firstTaskId), _action, tasks)
      .then(tasks => {
        resolve(tasks);
      })
      .catch(err => {
        reject(err);
      });
    function _loop (promise, fn, tasks) {
      return promise
        .then(task => fn(task))
        .then(result => {
          if (result.nextTaskId) {
            return _loop(_findTaskById(result.nextTaskId), _action, result.tasks);
          } else {
            return Promise.resolve(result.tasks);
          }
        });
    }
    function _action (task) {
      tasks.push(task);
      return {
        nextTaskId: task.next_task_id,
        tasks: tasks
      };
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
