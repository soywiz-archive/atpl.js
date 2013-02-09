///<reference path='./imports.d.ts'/>

import assert = module('assert');

import tp  = module('../lib/TemplateProvider');
var FileSystemTemplateProvider = tp.FileSystemTemplateProvider;
var MemoryTemplateProvider     = tp.MemoryTemplateProvider;

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
			assert.assert(false, '');
		} catch (e) {
		}
		
		var templateContent = 'Hello World!';
		
		//console.log(templateProvider.registry);
		templateProvider.add('simple.atpl', templateContent);
		//console.log(templateProvider.registry);
		assert.equal(templateContent, templateProvider.getSync('simple.atpl', false));
	});
});

