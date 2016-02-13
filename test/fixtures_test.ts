///<reference path='./imports.d.ts'/>

import assert = require('assert');
import fs = require('fs');

import { TemplateParser } from '../lib/parser/TemplateParser';
import { MemoryTemplateProvider } from '../lib/provider/MemoryTemplateProvider';
import { LanguageContext } from '../lib/LanguageContext';
import { TemplateConfig } from '../lib/TemplateConfig';
import { RuntimeContext } from '../lib/runtime/RuntimeContext';
import RuntimeUtils = require('../lib/runtime/RuntimeUtils');
import Default = require('../lib/lang/Default');

function handleSet(name:string, data:any) {
	var parts = data.split('===');
	var test = { 
        title: 'untitled: ' + name, description: '',
        input: {},
        expected: '',
        templates: <{[key:string]:string}>{  },
        eval: <any>undefined,
        eval_after: <any>undefined,
        exception: <any>undefined
    };
    
	for (var n = 0; n < parts.length; n++) {
		var part = parts[n].trim();
		var token = /^([\w:]+)\s+([\S\s]*)$/igm.exec(part);

		//if (name == 'autoescape.set') { console.log('""' + part + '""'); console.log(JSON.stringify(token)); console.log(''); }

		if (token != null) {
			var key = token[1].trim().toLowerCase();
			var value = token[2].trim();
			switch (key) {
				case 'title': test.title = value + ' (' + name + ')'; break;
				case 'description': test.description = value; break;
				case 'input': test.input = JSON.parse(value); break;
				case 'output': test.expected = value; break;
				case 'eval': test.eval = value; break;
				case 'eval_after': test.eval_after = value; break;
				case 'exception': test.exception = value; break;
				default: {
					var pp = key.split(':');
					switch (pp[0]) {
						case 'template':
							(<{[key:string]:string}>test.templates)[pp[1]] = value;
							break;
						default:
							throw(new Error("Unknown key '" + key + "'"));
					}
				}
			}
		}
	}

	it(test.title, function () {
		var templateParser = createTemplateParser(<{[key:string]:string}>test.templates);

		if ((<{[key:string]:string}>test.templates)['main'] === undefined) {
			console.log(test);
		}

		if (test.eval !== undefined) {
			Function("test", "RuntimeUtils", test.eval)(test, RuntimeUtils);
		}

		//console.log(templateParser.getEvalCode('test').output);
		try {
			var result = templateParser.compileAndRenderToString('main', test.input).trim().replace(/\r\n/g, '\n');
			var expected = test.expected.trim().replace(/\r\n/g, '\n');
			if (test.eval_after) eval(test.eval_after);
		} catch (e) {
			if (test.exception === undefined) {
				console.log(test);
				console.log(templateParser.getEvalCode('main').output);
				throw (e);
			}
			if (e.message === undefined) throw (new Error("ERROR, INVALID EXCEPTION! " + JSON.stringify(e)));
			//console.log(e); 
			assert.equal(e.message, test.exception);
			return;
		}
        if (test.exception !== undefined) (<any>assert.fail)('Excepting exception "' + test.exception + '"');
        if (result !== expected) {
            console.log('--------------------------------------');
            console.log(test);
            console.log('--------------------------------------');
            console.log(templateParser.getEvalCode('main').output);
            console.log('--------------------------------------');
        }
		assert.equal(result, expected);
	});
}

function handleSets(path:string, name:string) {
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

function createTemplateParser(templates: { [key:string]:string }) {
	var templateProvider = new MemoryTemplateProvider();
    var languageContext = new LanguageContext();
	var templateParser = new TemplateParser(templateProvider, Default.register(languageContext));
    languageContext.trans = (text:string) => "FIXTRANS:" + text;

	for (var key in templates) {
		templateProvider.add(key, templates[key]);
	}

	return templateParser;
}

handleSets(__dirname, 'fixtures');

/*
var TestClass = function () { this.testClassValue = 17; };
TestClass.prototype.testMethod = function (a, b, c) { return 'a=' + a + "," + 'b=' + b + "," + 'c=' + c + "," + 'testClassValue=' + this.testClassValue + "," }
*/
class TestClass {
    testClassValue = 17;
    testMethod(a:any, b:any, c:any) { return 'a=' + a + "," + 'b=' + b + "," + 'c=' + c + "," + 'testClassValue=' + this.testClassValue + "," }
}

describe('extra fixtures', function () {
	it('function call as argument', function () {
		var templateParser = createTemplateParser({
			main : '{{ test.func(1, 2, 3) }}',
		});

		assert.equal(
			templateParser.compileAndRenderToString('main', { test: { func: function (a:any, b:any, c:any) { return 'hello' + a + b + c; } } }),
			'hello123'
		);
	});

	it('function call as argument with context', function () {
		var templateParser = createTemplateParser({
			main: '{{ test.testMethod(1, 2, 3) }}',
		});

		assert.equal(
			templateParser.compileAndRenderToString('main', { test: new TestClass() }),
			'a=1,b=2,c=3,testClassValue=17,'
		);
	});

	it('method not accessed as property', function () {
		var templateParser = createTemplateParser({
			main: '{{ test.func[2] }}',
		});

		assert.equal(
			templateParser.compileAndRenderToString('main', { test: { func: function () { return [0, 1, 2, 3]; } } }),
			''
		);
	});

	it('test cache', function () {
		var templateProvider = new MemoryTemplateProvider();
		var languageContext = Default.register(new LanguageContext());
		var templateParser = new TemplateParser(templateProvider, languageContext);

        languageContext.templateConfig.setCacheTemporal(false, function () {
			templateProvider.add('test', 'a');
            assert.equal(templateParser.compileAndRenderToString('test', {}), 'a');
			templateProvider.add('test', 'b');
            assert.equal(templateParser.compileAndRenderToString('test', {}), 'b');
		});

		languageContext.templateConfig.setCacheTemporal(true, function () {
			templateProvider.add('test2', 'a');
			assert.equal(templateParser.compileAndRenderToString('test2'), 'a');
			templateProvider.add('test2', 'b');
			assert.equal(templateParser.compileAndRenderToString('test2'), 'a');
		});
	});
});
