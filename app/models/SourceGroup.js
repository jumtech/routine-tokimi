'use strict';

class SourceGroup {
  constructor(data) {
    this.data = data;
  }

  get type() { return this.data['type']; }
  get groupId() { return this.data['groupId']; }
}

module.exports = SourceGroup;
