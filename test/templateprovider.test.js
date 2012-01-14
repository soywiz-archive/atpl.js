var tp  = require('../lib/templateprovider.js');
var assert = require('assert');

FileSystemTemplateProvider = tp.FileSystemTemplateProvider;

module.exports = {
	'test': function(done) {
		var templateProvider = new FileSystemTemplateProvider(__dirname + '/templates');
		templateProvider.get('simple.atpl', function(data) {
			assert.equal('Hello World!', data);
			done();
		});
	},
};