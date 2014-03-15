///<reference path='./imports.d.ts'/>
var assert = require('assert');

var StringReader = require('../lib/lexer/StringReader');

describe('StringReader', function () {
    it('smart test', function () {
        var stringReader = new StringReader('Hello {{ 1 }} World {{ 2 }}');
        assert.equal(true, stringReader.hasMore());
        assert.equal('H', stringReader.readChar());
        assert.equal('e', stringReader.readChar());
        var index = stringReader.findRegexp(/\{\{/).position;
        assert.equal(4, index);
        stringReader.skipChars(index);
        assert.equal('{{', stringReader.readChars(2));
    });
    it('eof test', function () {
        var stringReader = new StringReader('123');
        assert.equal(true, stringReader.hasMore());
        stringReader.skipChars(3);
        assert.equal(false, stringReader.hasMore());
    });
    it('readLeft test', function () {
        var stringReader = new StringReader('12345');
        assert.equal(5, stringReader.getLeftCount());
        stringReader.skipChars(1);
        assert.equal(4, stringReader.getLeftCount());
        assert.equal('2345', stringReader.readLeft());
    });
});
