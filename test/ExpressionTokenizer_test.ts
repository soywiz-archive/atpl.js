///<reference path='./imports.d.ts'/>

import assert = require('assert');
import fs = require('fs');

import ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer');
import StringReader = require('../lib/lexer/StringReader');

describe('ExpressionTokenizer', function() {
	it('tokenize 0', function () {
		var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('0')).tokenizeAll();
		assert.equal(tokens[0].value, 0);
		
		//console.log(expressionTokenizer);
	});

	it('tokenize string', function () {
		var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('"test"')).tokenizeAll();
		assert.equal(tokens[0].value, "test");

		//console.log(expressionTokenizer);
	});

	it('tokenize ==', function () {
		var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('0 == 1')).tokenizeAll();
		//console.log(expressionTokenizer);
	});
});
