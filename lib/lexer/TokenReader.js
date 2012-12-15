
var TokenReader = (function () {
    function TokenReader(tokens) {
        this.tokens = tokens;
        this.length = this.tokens.length;
        this.position = 0;
    }
    Object.defineProperty(TokenReader.prototype, "hasMore", {
        get: function () {
            return this.getLeftCount() > 0;
        },
        enumerable: true,
        configurable: true
    });
    TokenReader.prototype.getLeftCount = function () {
        return this.tokens.length - this.position;
    };
    TokenReader.prototype.peek = function () {
        if(this.position >= this.length) {
            return {
                type: 'eof',
                value: null,
                rawValue: null
            };
        }
        return this.tokens[this.position];
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
        return null;
    };
    TokenReader.prototype.expectAndMoveNext = function (values) {
        var ret = this.checkAndMoveNext(values);
        if(ret === null) {
            throw (new Error("Expected one of " + JSON.stringify(values) + " but get '" + this.peek().value + "'"));
        }
        return ret;
    };
    return TokenReader;
})();
exports.TokenReader = TokenReader;
