var assert = require('assert')

var ExpressionTokenizer = require('../lib/lexer/ExpressionTokenizer')
var StringReader = require('../lib/lexer/StringReader')
describe('ExpressionTokenizer', function () {
    it('tokenize 0', function () {
        var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('0')).tokenize();
        assert.equal(tokens[0].value, 0);
    });
    it('tokenize string', function () {
        var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('"test"')).tokenize();
        assert.equal(tokens[0].value, "test");
    });
    it('tokenize ==', function () {
        var tokens = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader('0 == 1')).tokenize();
    });
});
