'use strict';
const WebhookEvent = require('./WebhookEvent.js');

class PostbackEvent extends WebhookEvent {
  get replyToken() { return this.data.replyToken; }
  get postbackData() { return this.data.postback.data; }
}

module.exports = PostbackEvent;
