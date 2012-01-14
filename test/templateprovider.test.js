var tp  = require('../lib/templateprovider.js');
var assert = require('assert');

FileSystemTemplateProvider = tp.FileSystemTemplateProvider;
MemoryTemplateProvider     = tp.MemoryTemplateProvider;

module.exports = {
	'test file system': function(done) {
		var templateProvider = new FileSystemTemplateProvider(__dirname + '/templates');
		templateProvider.get('simple.atpl', function(data) {
			assert.equal('Hello World!', data);
			done();
		});
	},
	'test memory': function(done) {
		var templateProvider = new MemoryTemplateProvider();
		try {
			templateProvider.get('simple.atpl', function(data) {
				assert.fail();
			});
			assert.fail();
		} catch (e) {
		}
		
		var templateContent = 'Hello World!';
		
		//console.log(templateProvider.registry);
		templateProvider.add('simple.atpl', templateContent);
		//console.log(templateProvider.registry);
		templateProvider.get('simple.atpl', function(data) {
			assert.equal(templateContent, data);
			done();
		});
	},
};