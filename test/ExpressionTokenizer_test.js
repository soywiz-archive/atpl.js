///<reference path='./imports.d.ts'/>
var assert = require('assert');

var ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer');
var StringReader = require('../lib/lexer/StringReader');

describe('ExpressionTokenizer', function () {
    it('tokenize 0', function () {
        var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader('0')).tokenizeAll();
        assert.equal(tokens[0].value, 0);
        //console.log(expressionTokenizer);
    });

    it('tokenize string', function () {
        var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader('"test"')).tokenizeAll();
        assert.equal(tokens[0].value, "test");
        //console.log(expressionTokenizer);
    });

    it('tokenize ==', function () {
        var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader('0 == 1')).tokenizeAll();
        //console.log(expressionTokenizer);
    });
});
