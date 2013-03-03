///<reference path='./imports.d.ts'/>

import assert = module('assert');
import fs = module('fs');

import StringReader        = module('../lib/lexer/StringReader');
import ExpressionTokenizer = module('../lib/lexer/ExpressionTokenizer');
import TokenReader         = module('../lib/lexer/TokenReader');
import ExpressionParser = module('../lib/parser/ExpressionParser');
import TokenParserContext = module('../lib/parser/TokenParserContext');
import SandboxPolicy = module('../lib/SandboxPolicy');

var tokenParserContext = new TokenParserContext.TokenParserContext(new TokenParserContext.TokenParserContextCommon(), new SandboxPolicy.SandboxPolicy());

describe("ExpressionParser", () => {
	it('operator precedence simple test', () => {
		var expressionParser = new ExpressionParser.ExpressionParser(new TokenReader.TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('1 + 2 * 3 + 1')).tokenize()), tokenParserContext);
		var parseNode = expressionParser.parseExpression();
		assert.equal('((1 + (2 * 3)) + 1)', parseNode.generateCode());
	});

	it('array definition test', () => {
		var expressionParser = new ExpressionParser.ExpressionParser(new TokenReader.TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('[1, (2 + 3), -4]')).tokenize()), tokenParserContext);
		var parseNode = expressionParser.parseExpression();
		assert.equal('[1, (2 + 3), -(4)]', parseNode.generateCode());
	});
});