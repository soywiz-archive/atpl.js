///<reference path='./imports.d.ts'/>

import assert = require('assert');

import FileSystemTemplateProvider = require('../lib/provider/FileSystemTemplateProvider');
import MemoryTemplateProvider = require('../lib/provider/MemoryTemplateProvider');

describe('TemplateProvider', () => {
	it('test file system', function(done) {
		var templateProvider = new FileSystemTemplateProvider(__dirname + '/templates');
		assert.equal('Hello {{ name }}!', templateProvider.getSync('simple.html', false));

		//templateProvider.getAsync('simple.atpl', function(data) {
		//	assert.equal('Hello World!', data);
		//	done();
		//});
		done();
	});

	it('test memory', () => {
		var templateProvider = new MemoryTemplateProvider();
		try {
			templateProvider.getSync('simple.atpl', false);
			assert(false, '');
		} catch (e) {
		}
		
		var templateContent = 'Hello World!';
		
		//console.log(templateProvider.registry);
		templateProvider.add('simple.atpl', templateContent);
		//console.log(templateProvider.registry);
		assert.equal(templateContent, templateProvider.getSync('simple.atpl', false));
	});
});

