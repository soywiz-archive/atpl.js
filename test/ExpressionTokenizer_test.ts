///<reference path='./imports.d.ts'/>

import assert = module('assert');
import fs = module('fs');

import ExpressionTokenizer = module('../lib/lexer/ExpressionTokenizer');
import StringReader = module('../lib/lexer/StringReader');

describe('ExpressionTokenizer', function() {
	it('tokenize 0', function () {
		var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('0')).tokenize();
		assert.equal(tokens[0].value, 0);
		
		//console.log(expressionTokenizer);
	});

	it('tokenize string', function () {
		var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('"test"')).tokenize();
		assert.equal(tokens[0].value, "test");

		//console.log(expressionTokenizer);
	});

	it('tokenize ==', function () {
		var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('0 == 1')).tokenize();
		//console.log(expressionTokenizer);
	});
});
