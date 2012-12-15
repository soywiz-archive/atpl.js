var assert = require('assert');
var fs = require('fs');

var ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer.js').ExpressionTokenizer;

describe('ExpressionTokenizer', function() {
	it('tokenize 0', function () {
		var tokens = new ExpressionTokenizer(new StringReader('0')).tokenize();
		assert.equal(tokens[0].value, 0);
		
		//console.log(expressionTokenizer);
	});

	it('tokenize string', function () {
		var tokens = new ExpressionTokenizer(new StringReader('"test"')).tokenize();
		assert.equal(tokens[0].value, "test");

		//console.log(expressionTokenizer);
	});

	it('tokenize ==', function () {
		var tokens = new ExpressionTokenizer(new StringReader('0 == 1')).tokenize();
		//console.log(expressionTokenizer);
	});
});