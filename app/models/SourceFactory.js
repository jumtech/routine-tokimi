'use strict';

const SourceUser = require('./SourceUser.js');
const SourceGroup = require('./SourceGroup.js');
const SourceFactrory = require('./SourceFactory.js');

class SourceFactory {
  static create(data) {
    switch (data.type) {
      case "user":
        return new SourceUser(data);
      case "group":
        return new SourceGroup(data);
      case "room":
        return new SourceRoom(data);
    }
  }
}

module.exports = SourceFactory;
