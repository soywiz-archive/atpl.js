///<reference path='./imports.d.ts'/>
"use strict";
var assert = require('assert');
var StringReader_1 = require('../lib/lexer/StringReader');
var ExpressionTokenizer_1 = require('../lib/lexer/ExpressionTokenizer');
var TokenReader_1 = require('../lib/lexer/TokenReader');
var ExpressionParser_1 = require('../lib/parser/ExpressionParser');
var TokenParserContext_1 = require('../lib/parser/TokenParserContext');
var SandboxPolicy_1 = require('../lib/SandboxPolicy');
var tokenParserContext = new TokenParserContext_1.TokenParserContext(new TokenParserContext_1.TokenParserContextCommon(), new SandboxPolicy_1.SandboxPolicy());
var parserNodeGenerateCodeContext = { doWrite: true };
describe("ExpressionParser", function () {
    it('operator precedence simple test', function () {
        var expressionParser = new ExpressionParser_1.ExpressionParser(new TokenReader_1.TokenReader(new ExpressionTokenizer_1.ExpressionTokenizer(new StringReader_1.StringReader('1 + 2 * 3 + 1'))), tokenParserContext);
        var parseNode = expressionParser.parseExpression();
        assert.equal('((1 + (2 * 3)) + 1)', parseNode.generateCode(parserNodeGenerateCodeContext));
    });
    it('array definition test', function () {
        var expressionParser = new ExpressionParser_1.ExpressionParser(new TokenReader_1.TokenReader(new ExpressionTokenizer_1.ExpressionTokenizer(new StringReader_1.StringReader('[1, (2 + 3), -4]'))), tokenParserContext);
        var parseNode = expressionParser.parseExpression();
        assert.equal('[1, (2 + 3), -(4)]', parseNode.generateCode(parserNodeGenerateCodeContext));
    });
});
