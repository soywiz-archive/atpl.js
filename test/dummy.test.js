var atpl   = require('../');
var assert = require('assert');
var fs     = require('fs');

describe("dummy", function () {
	it('test simple', function () {
		assert.equal('test', atpl.compileAndExecuteString('test'));
	});

	it('test simple2', function () {
	});
});