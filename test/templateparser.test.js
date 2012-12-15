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
	'test simple function random': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ random() }}');
		//console.log(templateParser.getEvalCode('test').output);
		//Math.random = function () { return 777; };
		assert.notEqual(
			templateParser.compileAndRenderToString('test'),
			""
		);
	},
	'test simple extends': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base', 'Hello {% block test %}Test{% endblock %}');
		templateProvider.add('test', '{% extends "base" %}No{% block test %}World{% endblock%}No');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"Hello World"
		);
	},
	'test simple extends 2': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base', 'Hello {% block test %}Test{% endblock %}{% block test2 %} Wow{% endblock %}');
		templateProvider.add('test', '{% extends "base" %}No{% block test %}World{% endblock%}No');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"Hello World Wow"
		);
	},
	'test conditional extends': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base1', 'Hello {% block test %}Test{% endblock %}');
		templateProvider.add('base2', 'Goodbye {% block test %}Test{% endblock %}');
		templateProvider.add('test', '{% extends cond ? "base1" : "base2" %}No{% block test %}World{% endblock%}No');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { cond : false }),
			"Goodbye World"
		);
	},
	'test extends 2': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base1', '[{% block test1 %}1a{% endblock %}{% block test2 %}1b{% endblock %}{% block test3 %}1c{% endblock %}]');
		templateProvider.add('base2', '{% extends "base1" %}{% block test2 %}2b{% endblock %}');
		templateProvider.add('base3', '{% extends "base2" %}No{% block test3 %}3c{% endblock%}No');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('base3', { cond: false }),
			"[1a2b3c]"
		);
	},
	'test extends 3': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base1', '[{% block test_a %}1a{% endblock %}{% block test_b %}1b{% endblock %}{% block test_c %}1c{% endblock %}{% block test_d %}1d{% endblock %}]');
		templateProvider.add('base2', '{% extends "base1" %}{% block test_b %}2b{% endblock %}');
		templateProvider.add('base3', '{% extends "base2" %}No{% block test_c %}3c{% endblock%}No');
		templateProvider.add('base4', '{% extends "base3" %}No{% block test_d %}4d{% endblock%}No');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('base4', { cond: false }),
			"[1a2b3c4d]"
		);
	},
	'test create block inside blocks': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('base1', 'a{% block body %}b{% endblock %}c');
		templateProvider.add('base2', '{% extends "base1" %}{% block body %}A{% block left %}B{% endblock %}C{% block right %}D{% endblock %}E{% endblock %}');
		templateProvider.add('base3', '{% extends "base2" %}No{% block left %}[Z]{% endblock%}No');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('base3', { cond: false }),
			"aA[Z]CDEc"
		);
	},
	'test simple if': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% if 0 %}0{% else %}1{% if 1 %}2{% endif%}{% endif %} ');
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"12 "
		);
	},
	'test simple for': function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ hi }}{{ n }}{% for n in [1, 2, 3, 4] %}{{ n }}{% endfor %}{{ n }}');
		assert.equal(
			templateParser.compileAndRenderToString('test', { hi: 'Hello:' }),
			"Hello:1234"
		);
	},
	'test simple for with range and reverse': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ hi }}{{ n }}{% for n in range(1, 4)|reverse %}{{ n }}{% endfor %}{{ n }}');
		assert.equal(
			templateParser.compileAndRenderToString('test', { hi: 'Hello:' }),
			"Hello:4321"
		);
	},
	'test variable for': function () {
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
		assert.equal(
			templateParser.compileAndRenderToString('test', { msg: '<">__<">' }),
			"&lt;&quot;&gt;__&lt;&quot;&gt;"
		);
	},
	'test autoescape tag': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% autoescape false %}{{ msg }}{{ msg }}{% endautoescape %}');
		assert.equal(
			templateParser.compileAndRenderToString('test', { msg: '<">' }),
			'<"><">'
		);
	},
	'test invalid endtag': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% endautoescape %}');
		try {
			templateParser.compileAndRenderToString('test');
			assert.fail();
		} catch (e) {
		}
	},
	'test raw': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ msg|raw }}');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { msg: '<">__<">' }),
			'<">__<">'
		);
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