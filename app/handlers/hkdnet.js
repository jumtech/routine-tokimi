module.exports = function(req, res, next) {
  res.statusCode = 200;
  res.end();

  var events = req.body.events;
  events.forEach(function(event) {
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
      var options = {
        url: "https://api.line.me/v2/bot/message/reply",
        headers: {
          "Content-Type" : "application/json; charset=UTF-8",
          "Authorization" : "Bearer " + process.env.HKDNET_TOKEN
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
    } else if (event.type == "follow") {
      /* 友達追加・ブロック解除 */
    } else if (event.type == "unfollow") {
      /* ブロック */
    }
  });
};
