'use strict';

class SourceRoom {
  constructor (data) {
    this.data = data;
  }

  get type () { return this.data['type']; }
  get roomId () { return this.data['roomId']; }
}

module.exports = SourceRoom;
