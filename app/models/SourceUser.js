'use strict';

class SourceUser {
  constructor(data) {
    this.data = data;
  }

  get type() { return this.data['type']; }
  get userId() { return this.data['userId']; }
}

module.exports = SourceUser;
