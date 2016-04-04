///<reference path='../imports.d.ts'/>
"use strict";
var TokenReader = (function () {
    function TokenReader(tokenizer) {
        this.tokenizer = tokenizer;
        this.tokens = [];
        this.eof = false;
        //this.tokens = tokenizer.tokenizeAll();
        //this.length = this.tokens.length;
        this.position = 0;
    }
    TokenReader.prototype.readToken = function () {
        //if (!this.hasMore()) return false;
        if (!this.tokenizer.hasMore())
            return false;
        this.tokens.push(this.tokenizer.readNext());
        return true;
    };
    TokenReader.prototype.getOffset = function () {
        return this.position;
    };
    TokenReader.prototype.getSlice = function (start, end) {
        return this.tokens.slice(start, end);
    };
    TokenReader.prototype.getSliceWithCallback = function (readCallback) {
        var start = this.getOffset();
        readCallback();
        var end = this.getOffset();
        return this.getSlice(start, end);
    };
    TokenReader.prototype.hasMore = function () {
        if (this.position < this.tokens.length)
            return true;
        return this.tokenizer.hasMore();
    };
    TokenReader.prototype.peek = function (offset) {
        if (offset === void 0) { offset = 0; }
        while (this.tokens.length <= this.position + offset) {
            if (!this.readToken())
                return { type: 'eof', value: null, rawValue: null, stringOffset: -1 };
        }
        return this.tokens[this.position + offset];
    };
    TokenReader.prototype.skip = function (count) {
        if (count === void 0) { count = 1; }
        this.position += count;
    };
    TokenReader.prototype.read = function () {
        try {
            return this.peek();
        }
        finally {
            this.skip(1);
        }
    };
    TokenReader.prototype.checkAndMoveNext = function (values) {
        var peekValue = this.peek().value;
        if (values.indexOf(peekValue) != -1) {
            this.skip(1);
            return peekValue;
        }
        return undefined;
    };
    TokenReader.prototype.checkAndMoveNextMultiToken = function (values) {
        var peekValue1 = this.peek(0).value;
        var peekValue2 = peekValue1 + ' ' + this.peek(1).value;
        if (values.indexOf(peekValue2) != -1) {
            this.skip(2);
            return peekValue2;
        }
        if (values.indexOf(peekValue1) != -1) {
            this.skip(1);
            return peekValue1;
        }
        return undefined;
    };
    TokenReader.prototype.expectAndMoveNext = function (values) {
        var ret = this.checkAndMoveNext(values);
        //var hasNull = values.indexOf(null) != -1;
        if (ret === undefined)
            throw (new Error("Expected one of " + JSON.stringify(values) + " but get '" + this.peek().value + "'"));
        return ret;
    };
    return TokenReader;
}());
exports.TokenReader = TokenReader;
