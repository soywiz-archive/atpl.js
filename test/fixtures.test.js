var assert = require('assert');
var fs = require('fs');

TemplateParser         = require('../lib/parser/TemplateParser.js').TemplateParser;
MemoryTemplateProvider = require('../lib/TemplateProvider.js').MemoryTemplateProvider;
RuntimeContext = require('../lib/runtime/RuntimeContext.js').RuntimeContext;
RuntimeUtils = require('../lib/runtime/RuntimeUtils.js');

module.exports = {};

function handleSet(name, data) {
	var parts = data.split('===');
	var test = { title: 'untitled: ' + name, input: {}, expected: '', templates: {}, eval: '', exception: false };
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
				case 'exception': test.exception = value; break;
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

handleSets(__dirname, 'fixtures');
