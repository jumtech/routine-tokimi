'use strict';

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
    this._source = new Source(this.data['source']);
    return this._source;
  }
}

module.exports = WebhookEvent;
