var assert = require('assert');
var fs = require('fs');

TemplateParser         = require('../lib/parser/TemplateParser.js').TemplateParser;
MemoryTemplateProvider = require('../lib/TemplateProvider.js').MemoryTemplateProvider;
RuntimeContext = require('../lib/runtime/RuntimeContext.js').RuntimeContext;
RuntimeUtils = require('../lib/runtime/RuntimeUtils.js');

module.exports = {};

function handleSet(name, data) {
	var parts = data.split('===');
	var test = { title: 'untitled: ' + name, input: {}, expected: '', templates: {}, eval: '' };
	for (var n = 0; n < parts.length; n++) {
		var part = parts[n].trim();
		var token = /^([\w:]+)\s+(.*)$/m.exec(part);
		//console.log(part);
		if (token != null) {
			var key = token[1].trim().toLowerCase();
			var value = token[2].trim();
			switch (key) {
				case 'title': test.title = value + ' (' + name + ')'; break;
				case 'input': test.input = JSON.parse(value); break;
				case 'output': test.expected = value; break;
				case 'eval': test.eval = value; break;
				default: {
					var pp = key.split(':');
					switch (pp[0]) {
						case 'template':
							test.templates[pp[1]] = value;
							break;
						default:
							throw(new Error("Unknown key '" + key + "'"));
					}
				}
			}
		}
	}
	it(test.title, function() {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		for (var key in test.templates) {
			templateProvider.add(key, test.templates[key]);
		}

		if (test.templates['main'] === undefined) {
			console.log(test);
		}

		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('main', test.input),
			test.expected
		);
	});
}

function handleSets(path, name) {
	describe(name, function() {
		var rpath = path + '/' + name;
		var sets = fs.readdirSync(rpath);
		for (var n = 0; n < sets.length; n++) {
			var rfile = rpath + '/' + sets[n];
			if (fs.statSync(rfile).isDirectory()) {
				handleSets(rpath, sets[n]);
			} else {
				handleSet(sets[n], fs.readFileSync(rfile, 'utf-8'));
			}
		}
	});
}

handleSets(__dirname, 'sets');

module.exports = {
	'test simple if': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% if 0 %}0{% else %}1{% if 1 %}2{% endif%}{% endif %} ');
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"12 "
		);
	},
	'test simple if elseif else': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% if v == 0 %}0{% elseif v == 1 %}1{% elseif v == 2 %}2{% else %}else{% endif %}');
		assert.equal(
			templateParser.compileAndRenderToString('test', { v : 2 }),
			"2"
		);
	},
	'test nested for': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test',
			"{% for x in range(0, 3) %}{% for y in range(0, 3) %}{{ x * y }}{% endfor %},{% endfor %}" +
		"");
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { v: 2 }),
			"0000,0123,0246,0369,"
		);
	},
	'test for key/values': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test',
			"{% for key, value in data %}{{ key }}:{{ value }},{% endfor %}" +
		"");
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { data: { a : 1, b : 2, c : 'c' } }),
			"a:1,b:2,c:c,"
		);
	},
	'test for if': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test',
			"{% for user in users if user.active %}{{ user.name }},{% endfor %}" +
		"");
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { users: [ { name: 'soywiz', active: true }, { name: 'test', active: false }, { name: 'demo', active: true } ] }),
			"soywiz,demo,"
		);
	},
	'test set tag': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test',
			"{% autoescape false %}" +
			"{% set foo1 = 'foo' %}" +
			"{% set foo2 = [1, 2] %}" +
			"{% set foo3 = {'foo': 'bar'} %}" +
			"{% set foo4 = 'foo' ~ 'bar' %}" +
			//"{% set foo5, bar = 'foo', 'bar' %}" +
			"{{ foo1 }}," +
			"{{ foo2 }}," +
			"{{ foo3 }}," +
			"{{ foo4 }}," +
			"{% endautoescape %}" +
		"");
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { v : 2 }),
			'foo,[1,2],{"foo":"bar"},foobar,'
		);
	},
	'test set tag tuple': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test',
			"{% autoescape false %}" +
			"{% set foo, bar = 'foo', 'bar' %}" +
			"{{ foo }}," +
			"{{ bear }}," +
			"{% endautoescape %}" +
		"");
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { v: 2 }),
			'foo,bar,'
		);
	},
	'test for loop key': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);

		assert.fail('infinite loop [fixme]');

		templateProvider.add('test',
			"{% set n = 'a' %}" +
			"{% for n in range(7, 9) %}" +
			"{{ n }}," +
			"{{ loop.index }}," +
			"{{ loop.index0 }}", +
			"{{ loop.revindex }}," +
			"{{ loop.revindex0 }}," +
			"{{ loop.first }}," +
			"{{ loop.last }}," +
			"{{ loop.length }}," +
			"{{ loop.parent.n }}," +
			"{% endfor %}" +
		"");
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test', { v: 2 }),
			"7,1,0,?,?,true,false,3,a," +
			"8,2,1,?,?,false,false,3,a," +
			"9,3,2,?,?,false,true,3,a," +
		'');
	},
	'test range operator with filter': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% for n in "a"|upper.."e"|upper %}{{ n }}{% endfor %}');
		//console.log(templateParser.getEvalCode('test').output);
		assert.equal(
			templateParser.compileAndRenderToString('test'),
			"ABCDE"
		);
	},
	'test simple for': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{{ hi }}{{ n }}{% for n in [1, 2, 3, 4] %}{{ n }}{% endfor %}{{ n }}');
		assert.equal(
			templateParser.compileAndRenderToString('test', { hi: 'Hello:' }),
			"Hello:1234"
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
	'test for else': function () {
		var templateProvider = new MemoryTemplateProvider();
		var templateParser = new TemplateParser(templateProvider);
		templateProvider.add('test', '{% for n in list %}{{ n * 2 }}{% else %}empty{% endfor %}');
		assert.equal(
			templateParser.compileAndRenderToString('test', { hi: 'Hello:', n: '[a]', list: [] }),
			"empty"
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
};