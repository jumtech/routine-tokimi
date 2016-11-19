'use strict';
const SourceUser = require('./SourceUser.js');

class WebhookEvent {
  constructor(data) {
    this.data = data;
  }

  get type() { return this.data['type']; }
  get timestamp() { return this.data['timestamp']; }
  get source() {
    if (this._source) {
      return this._source;
    }
    switch (this.data['source'].type) {
      case "user":
        this._source = new SourceUser(this.data['source']);
          break;
    }
    return this._source;
  }
}

module.exports = WebhookEvent;
