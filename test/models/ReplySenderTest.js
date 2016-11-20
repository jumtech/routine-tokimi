const assert = require('power-assert');
const RequestSender = require('../../app/models/ReplySender.js');

describe('ReplySender', function () {
  before(function () {
    this.sender = new RequestSender({
      token: "test-token"
    });
  });
  describe('baseOption', function () {
    before(function () {
      this.headers = this.sender.baseOption.headers;
    });
    describe('headers', function () {
      it('Authorization', function () {
        assert(this.headers['Authorization'] === 'Bearer test-token');
      });
    });
  });
});
