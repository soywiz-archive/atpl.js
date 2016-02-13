///<reference path='./imports.d.ts'/>

import assert = require('assert');
import fs = require('fs');

import { StringReader } from '../lib/lexer/StringReader';
import { ExpressionTokenizer } from '../lib/lexer/ExpressionTokenizer';
import { TokenReader } from '../lib/lexer/TokenReader';
import { ExpressionParser } from '../lib/parser/ExpressionParser';
import { TokenParserContext, TokenParserContextCommon } from '../lib/parser/TokenParserContext';
import { SandboxPolicy } from '../lib/SandboxPolicy';

import ParserNode = require('../lib/parser/ParserNode');

var tokenParserContext = new TokenParserContext(new TokenParserContextCommon(), new SandboxPolicy());
var parserNodeGenerateCodeContext: ParserNode.ParserNodeGenerateCodeContext = { doWrite: true };

describe("ExpressionParser", () => {
	it('operator precedence simple test', () => {
		var expressionParser = new ExpressionParser(new TokenReader(new ExpressionTokenizer(new StringReader('1 + 2 * 3 + 1'))), tokenParserContext);
		var parseNode = expressionParser.parseExpression();
		assert.equal('((1 + (2 * 3)) + 1)', parseNode.generateCode(parserNodeGenerateCodeContext));
	});

	it('array definition test', () => {
		var expressionParser = new ExpressionParser(new TokenReader(new ExpressionTokenizer(new StringReader('[1, (2 + 3), -4]'))), tokenParserContext);
		var parseNode = expressionParser.parseExpression();
		assert.equal('[1, (2 + 3), -(4)]', parseNode.generateCode(parserNodeGenerateCodeContext));
	});
});