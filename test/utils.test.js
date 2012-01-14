var utils  = require('../lib/Utils.js');
var assert = require('assert');

module.exports = {
	'simple normalize path': function() {
		assert.equal('/this/is/a/test', utils.normalizePath('/this/is//a/path/../test'));
		assert.equal('this/is/a/test', utils.normalizePath('this/is//a/path/../test'));
		assert.equal('', utils.normalizePath('../../'));
	},
	'path is inside': function() {
		assert.equal(true, utils.pathIsInside('/base', '/base'));
		assert.equal(true, utils.pathIsInside('/base/', '/base/'));
		assert.equal(true, utils.pathIsInside('/base', '/base/test'));
		assert.equal(true, utils.pathIsInside('/base', '/base/demo/../test'));
		assert.equal(false, utils.pathIsInside('/base', '/base/../test'));
		assert.equal(false, utils.pathIsInside('/base', '/base2'));
		assert.equal(false, utils.pathIsInside('/base/', '/base2/'));
	},
};