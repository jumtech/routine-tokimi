'use strict';

const TextMessage = require('./TextMessage.js');

class MessageFactory {
  static create(data) {
    switch (data.type) {
      case "text":
        return new TextMessage(data);
    }
  }
}

module.exports = MessageFactory;
