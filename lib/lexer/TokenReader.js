
var TokenReader = (function () {
    function TokenReader(tokens) {
        this.tokens = tokens;
        this.length = this.tokens.length;
        this.position = 0;
    }
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
        return this.getLeftCount() > 0;
    };
    TokenReader.prototype.getLeftCount = function () {
        return this.tokens.length - this.position;
    };
    TokenReader.prototype.peek = function (offset) {
        if (typeof offset === "undefined") { offset = 0; }
        if(this.position + offset >= this.length) {
            return {
                type: 'eof',
                value: null,
                rawValue: null,
                stringOffset: this.length
            };
        }
        return this.tokens[this.position + offset];
    };
    TokenReader.prototype.skip = function (count) {
        if (typeof count === "undefined") { count = 1; }
        this.position += count;
    };
    TokenReader.prototype.read = function () {
        var item = this.peek();
        this.skip(1);
        return item;
    };
    TokenReader.prototype.checkAndMoveNext = function (values) {
        var peekValue = this.peek().value;
        if(values.indexOf(peekValue) != -1) {
            this.skip(1);
            return peekValue;
        }
        return undefined;
    };
    TokenReader.prototype.checkAndMoveNextMultiToken = function (values) {
        var peekValue1 = this.peek(0).value;
        var peekValue2 = peekValue1 + ' ' + this.peek(1).value;
        if(values.indexOf(peekValue2) != -1) {
            this.skip(2);
            return peekValue2;
        }
        if(values.indexOf(peekValue1) != -1) {
            this.skip(1);
            return peekValue1;
        }
        return undefined;
    };
    TokenReader.prototype.expectAndMoveNext = function (values) {
        var ret = this.checkAndMoveNext(values);
        if(ret === undefined) {
            throw (new Error("Expected one of " + JSON.stringify(values) + " but get '" + this.peek().value + "'"));
        }
        return ret;
    };
    return TokenReader;
})();
exports.TokenReader = TokenReader;
