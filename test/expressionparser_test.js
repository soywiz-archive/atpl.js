///<reference path='./imports.d.ts'/>
var assert = require('assert');

var StringReader = require('../lib/lexer/StringReader');
var ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer');
var TokenReader = require('../lib/lexer/TokenReader');
var ExpressionParser = require('../lib/parser/ExpressionParser');
var TokenParserContext = require('../lib/parser/TokenParserContext');
var SandboxPolicy = require('../lib/SandboxPolicy');

var tokenParserContext = new TokenParserContext.TokenParserContext(new TokenParserContext.TokenParserContextCommon(), new SandboxPolicy.SandboxPolicy());
var parserNodeGenerateCodeContext = { doWrite: true };

describe("ExpressionParser", function () {
    it('operator precedence simple test', function () {
        var expressionParser = new ExpressionParser.ExpressionParser(new TokenReader.TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('1 + 2 * 3 + 1'))), tokenParserContext);
        var parseNode = expressionParser.parseExpression();
        assert.equal('((1 + (2 * 3)) + 1)', parseNode.generateCode(parserNodeGenerateCodeContext));
    });

    it('array definition test', function () {
        var expressionParser = new ExpressionParser.ExpressionParser(new TokenReader.TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('[1, (2 + 3), -4]'))), tokenParserContext);
        var parseNode = expressionParser.parseExpression();
        assert.equal('[1, (2 + 3), -(4)]', parseNode.generateCode(parserNodeGenerateCodeContext));
    });
});
