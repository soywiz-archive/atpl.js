var ttlib = require('../lib/lexer/TemplateTokenizer')
var assert = require('assert')

var TemplateTokenizer = ttlib.TemplateTokenizer;
describe('TemplateTokenizer', function () {
    it('just plain text', function () {
        var templateTokenizer = new TemplateTokenizer('plain text');
        var tokens = templateTokenizer.tokenizeAll();
        assert.equal(JSON.stringify([
            {
                type: "text",
                value: "plain text",
                "offsetStart": 0,
                "offsetEnd": 10,
                "rawText": "plain text"
            }
        ]), JSON.stringify(tokens));
    });
    it('comments test', function () {
        var templateTokenizer = new TemplateTokenizer('plain text {# this is a comment #} Hello! {# this is another comment #} ');
        var tokens = templateTokenizer.tokenizeAll();
        assert.equal(JSON.stringify([
            {
                type: "text",
                value: "plain text ",
                "offsetStart": 0,
                "offsetEnd": 11,
                "rawText": "plain text "
            }, 
            {
                type: "text",
                value: " Hello! ",
                "offsetStart": 34,
                "offsetEnd": 42,
                "rawText": " Hello! "
            }, 
            {
                type: "text",
                value: " ",
                "offsetStart": 71,
                "offsetEnd": 72,
                "rawText": " "
            }
        ]), JSON.stringify(tokens));
    });
});
