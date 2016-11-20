const assert = require('power-assert');
const MessageEvent = require('../../app/models/MessageEvent.js');

describe('MessageEvent', function () {
  describe('constructor', function () {
    before(function () {
      this.data = {
        "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
        "type": "message",
        "timestamp": 1462629479859,
        "source": {
          "type": "user",
          "userId": "U206d25c2ea6bd87c17655609a1c37cb8"
        },
        "message": {
          "id": "325708",
          "type": "text",
          "text": "Hello, world"
        }
      };
      this.subject = new MessageEvent(this.data);
    });
    it('type', function () { assert(this.subject.type === "message"); });
    it('timestamp', function () { assert(this.subject.timestamp === 1462629479859); });
    it('source', function () {
      assert(this.subject.source.type === "user");
      assert(this.subject.source.userId === "U206d25c2ea6bd87c17655609a1c37cb8");
    });
    it('message', function () {
      assert(this.subject.message.id === '325708');
    });
  });
});
