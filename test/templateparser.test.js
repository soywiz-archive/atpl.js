var assert = require('assert');

TemplateParser         = require('../lib/templateparser.js').TemplateParser;
MemoryTemplateProvider = require('../lib/templateprovider.js').MemoryTemplateProvider;

module.exports = {
	'test simple extends': function(done) {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base', 'Hello {% block test %}Test{% endblock %}');
		templateProvider.add('test', '{% extends "base" %}No{% block test %}World{% endblock%}No');
		templateParser.compileAndRenderToString('test', function(output) {
			assert.equal("Hello World", output);
			done();
		});
	},
	'test simple if': function(done) {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% if 0 %}0{% else %}1{% if 1 %}2{% endif%}{% endif %} ');
		templateParser.compileAndRenderToString('test', function(output) {
			assert.equal("12 ", output);
			done();
		});
	},
};