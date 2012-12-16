var assert = require('assert');
var fs     = require('fs');

StringReader        = require('../lib/lexer/StringReader.js').StringReader;
ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer.js').ExpressionTokenizer;
TokenReader         = require('../lib/lexer/TokenReader.js').TokenReader;
ExpressionParser    = require('../lib/parser/ExpressionParser.js').ExpressionParser;

describe("ExpressionParser", function() {
	it('operator precedence simple test', function() {
		var expressionParser = new ExpressionParser(new TokenReader(new ExpressionTokenizer(new StringReader('1 + 2 * 3 + 1')).tokenize()));
		var parseNode = expressionParser.parseExpression();
		assert.equal('((1 + (2 * 3)) + 1)', parseNode.generateCode());
	});

	it('array definition test', function () {
		var expressionParser = new ExpressionParser(new TokenReader(new ExpressionTokenizer(new StringReader('[1, (2 + 3), -4]')).tokenize()));
		var parseNode = expressionParser.parseExpression();
		assert.equal('[1, (2 + 3), -(4)]', parseNode.generateCode());
	});
});