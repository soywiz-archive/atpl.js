var assert = require('assert');
var fs = require('fs');

TemplateParser         = require('../lib/parser/TemplateParser.js').TemplateParser;
MemoryTemplateProvider = require('../lib/TemplateProvider.js').MemoryTemplateProvider;
RuntimeContext = require('../lib/runtime/RuntimeContext.js').RuntimeContext;
RuntimeUtils = require('../lib/runtime/RuntimeUtils.js');

module.exports = {};

function handleSet(name, data) {
	var parts = data.split('===');
	var test = { title: 'untitled: ' + name, input: {}, expected: '', templates: {}, eval: undefined, exception: undefined };
	for (var n = 0; n < parts.length; n++) {
		var part = parts[n].trim();
		var token = /^([\w:]+)\s+([\S\s]*)$/igm.exec(part);

		//if (name == 'autoescape.set') { console.log('""' + part + '""'); console.log(JSON.stringify(token)); console.log(''); }

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

		if (test.eval !== undefined) eval(test.eval);

		//console.log(templateParser.getEvalCode('test').output);
		try {
			assert.equal(
				templateParser.compileAndRenderToString('main', test.input).trim().replace(/\r\n/g, '\n'),
				test.expected.trim().replace(/\r\n/g, '\n')
			);
			if (test.exception !== undefined) assert.fail('Excepting exception "' + test.exception + '"');
		} catch (e) {
			if (test.exception === undefined) {
				console.log(test);
				throw (e);
			}
			assert.equal(e.message, test.exception);
		}
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
