'use strict';

const assert = require('power-assert');
const EventFactory = require('../../app/models/EventFactory.js');
const MessageEvent = require('../../app/models/MessageEvent.js');
const PostbackEvent = require('../../app/models/PostbackEvent.js');

describe('EventFactory', function() {
  describe('.create', function() {
    describe('typeがmessageのとき', function() {
      it('MessageEventを返す', function() {
        let source = EventFactory.create({
          type: "message",
        });
        assert(source instanceof MessageEvent);
      });
    });
    describe('typeがpostbackのとき', function() {
      it('PostbackEventを返す', function() {
        let source = EventFactory.create({
          type: "postback",
        });
        assert(source instanceof PostbackEvent);
      });
    });
  });
});
