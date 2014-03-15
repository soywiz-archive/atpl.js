///<reference path='./imports.d.ts'/>

import assert = require('assert');
import fs = require('fs');

import ParserNode = require('../lib/parser/ParserNode');
import StringReader = require('../lib/lexer/StringReader');
import ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer');
import TokenReader = require('../lib/lexer/TokenReader');
import ExpressionParser = require('../lib/parser/ExpressionParser');
import TokenParserContext = require('../lib/parser/TokenParserContext');
import SandboxPolicy = require('../lib/SandboxPolicy');

var tokenParserContext = new TokenParserContext.TokenParserContext(new TokenParserContext.TokenParserContextCommon(), new SandboxPolicy());
var parserNodeGenerateCodeContext: ParserNode.ParserNodeGenerateCodeContext = { doWrite: true };

describe("ExpressionParser", () => {
	it('operator precedence simple test', () => {
		var expressionParser = new ExpressionParser(new TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader('1 + 2 * 3 + 1'))), tokenParserContext);
		var parseNode = expressionParser.parseExpression();
		assert.equal('((1 + (2 * 3)) + 1)', parseNode.generateCode(parserNodeGenerateCodeContext));
	});

	it('array definition test', () => {
		var expressionParser = new ExpressionParser(new TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader('[1, (2 + 3), -4]'))), tokenParserContext);
		var parseNode = expressionParser.parseExpression();
		assert.equal('[1, (2 + 3), -(4)]', parseNode.generateCode(parserNodeGenerateCodeContext));
	});
});