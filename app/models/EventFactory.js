'use strict';

const MessageEvent = require('./MessageEvent.js');
const PostbackEvent = require('./PostbackEvent.js');

class EventFactory {
  static create (data) {
    switch (data.type) {
      case "message":
        return new MessageEvent(data);
      case "postback":
        return new PostbackEvent(data);
    }
  }
}

module.exports = EventFactory;
