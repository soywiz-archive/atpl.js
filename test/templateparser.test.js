var assert = require('assert');

TemplateParser         = require('../lib/parser/TemplateParser.js').TemplateParser;
MemoryTemplateProvider = require('../lib/TemplateProvider.js').MemoryTemplateProvider;
RuntimeContext         = require('../lib/runtime/RuntimeContext.js').RuntimeContext;

module.exports = {
	'test simple extends': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base', 'Hello {% block test %}Test{% endblock %}');
		templateProvider.add('test', '{% extends "base" %}No{% block test %}World{% endblock%}No');
		assert.equal("Hello World", templateParser.compileAndRenderToString('test'));
	},
	'test simple if': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% if 0 %}0{% else %}1{% if 1 %}2{% endif%}{% endif %} ');
		assert.equal("12 ", templateParser.compileAndRenderToString('test'));
	},
	'test simple for': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ hi }}{{ n }}{% for n in [1, 2, 3, 4] %}{{ n }}{% endfor %}{{ n }}');
		assert.equal("Hello:1234", templateParser.compileAndRenderToString('test', { hi : 'Hello:' }));
	},
	'test variable for': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ hi }}{{ n }}{% for n in list %}{{ n * 2 }}{% endfor %}{{ n }}');
		assert.equal("aHello:2468", templateParser.compileAndRenderToString('test', { hi : 'Hello:', list : [1, 2, 3, 4] }));
	},
	'test escape': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ msg }}');
		assert.equal("&lt;&quot;&gt;__&lt;&quot;&gt;", templateParser.compileAndRenderToString('test', { msg : '<">__<">' }));
	},
	/*
	'test simple for else': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ n }}{% for n in [] %}{{ n }}{% else %}No{% endfor %}{{ n }}');
		assert.equal("No", templateParser.compileAndRenderToString('test', { }));
	},
	*/
};