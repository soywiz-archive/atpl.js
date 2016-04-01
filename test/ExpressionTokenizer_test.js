///<reference path='./imports.d.ts'/>
"use strict";
var assert = require('assert');
var ExpressionTokenizer_1 = require('../lib/lexer/ExpressionTokenizer');
var StringReader_1 = require('../lib/lexer/StringReader');
describe('ExpressionTokenizer', function () {
    it('tokenize 0', function () {
        var tokens = new ExpressionTokenizer_1.ExpressionTokenizer(new StringReader_1.StringReader('0')).tokenizeAll();
        assert.equal(tokens[0].value, 0);
        //console.log(expressionTokenizer);
    });
    it('tokenize string', function () {
        var tokens = new ExpressionTokenizer_1.ExpressionTokenizer(new StringReader_1.StringReader('"test"')).tokenizeAll();
        assert.equal(tokens[0].value, "test");
        //console.log(expressionTokenizer);
    });
    it('tokenize ==', function () {
        var tokens = new ExpressionTokenizer_1.ExpressionTokenizer(new StringReader_1.StringReader('0 == 1')).tokenizeAll();
        //console.log(expressionTokenizer);
    });
});
