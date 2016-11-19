'use strict';

const assert = require('power-assert');
const SourceFactory = require('../../app/models/SourceFactory.js');
const SourceUser = require('../../app/models/SourceUser.js');
const SourceGroup = require('../../app/models/SourceGroup.js');
const SourceRoom = require('../../app/models/SourceRoom.js');

describe('SourceFactory', function() {
  describe('.create', function() {
    describe('typeがuserのとき', function() {
      it('SourceUserを返す', function() {
        let source = SourceFactory.create({
          type: "user",
          userId: "foo"
        });
        assert(source instanceof SourceUser);
      });
    });
    describe('typeがroomのとき', function() {
      it('SourceRoomを返す', function() {
        let source = SourceFactory.create({
          type: "room",
          roomId: "foo"
        });
        assert(source instanceof SourceRoom);
      });
    });
    describe('typeがgroupのとき', function() {
      it('SourceGroupを返す', function() {
        let source = SourceFactory.create({
          type: "group",
          groupId: "foo"
        });
        assert(source instanceof SourceGroup);
      });
    });
  });
});
