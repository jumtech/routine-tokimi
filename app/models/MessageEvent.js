'use strict';
const WebhookEvent = require('./WebhookEvent.js');
const MessageFactory = require('./MessageFactory.js');

class MessageEvent extends WebhookEvent {
  get replyToken () { return this.data.replyToken; }
  get message () {
    if (this._message) {
      return this._message;
    }
    this._message = MessageFactory.create(this.data['message']);
    return this._message;
  }
}

module.exports = MessageEvent;
