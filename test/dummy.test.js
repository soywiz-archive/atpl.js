var atpl   = require('../');
var assert = require('assert');
var fs     = require('fs');

module.exports = {
	'test simple': function() {
		assert.equal('test', atpl.compileAndExecuteString('test'));
	},

	'test simple2': function() {
	},
};