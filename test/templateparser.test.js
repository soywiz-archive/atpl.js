var assert = require('assert');

TemplateParser         = require('../lib/parser/TemplateParser.js').TemplateParser;
MemoryTemplateProvider = require('../lib/TemplateProvider.js').MemoryTemplateProvider;
RuntimeContext         = require('../lib/runtime/RuntimeContext.js').RuntimeContext;

module.exports = {
	'test simple 0': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ 0 }}');

		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"0"
		);
	},
	'test simple function range': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ range(0, 2) }}');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"[0,1,2]"
		);
	},
	'test simple extends': function () {
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
		assert.equal(
			templateParser.compileAndRenderToString('test', { hi: 'Hello:', n : '[a]', list: [1, 2, 3, 4] }),
			"Hello:[a]2468[a]"
		);
	},
	'test autoescape': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ msg }}');
		assert.equal("&lt;&quot;&gt;__&lt;&quot;&gt;", templateParser.compileAndRenderToString('test', { msg : '<">__<">' }));
	},
	'test raw': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ msg|raw }}');
		assert.equal('<">__<">', templateParser.compileAndRenderToString('test', { msg: '<">__<">' }));
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