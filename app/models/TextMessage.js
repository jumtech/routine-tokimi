'use strict';

class TextMessage {
  constructor(data) {
    this.data = data;
  }

  get id() { return this.data.id; }
  get type() { return this.data.type; }
  get text() { return this.data.text; }
}

module.exports = TextMessage;
