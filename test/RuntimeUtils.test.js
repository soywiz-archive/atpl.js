var assert = require('assert');
var fs = require('fs');

var RuntimeUtils = require('../lib/runtime/RuntimeUtils');

describe('RuntimeUtils', function () {
	it('sprintf', function () {
		assert.equal(RuntimeUtils.sprintf('Hello %03d %s', 10, 'World'), 'Hello 010 World');
	});
	it('date', function () {
		assert.equal(RuntimeUtils.date('d-m-Y', new Date(2010, 3 - 1, 1)), '01-03-2010');
	});
});