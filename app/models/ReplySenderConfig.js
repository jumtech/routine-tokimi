'use strict';

class ReplySenderConfig {
  constructor (data) {
    this.data = data;
  }

  get token () { return this.data.token; }
}

module.exports = ReplySenderConfig;
