var TokenParserContext = (function () {
    function TokenParserContext() {
        this.blocksOutput = {
        };
        this.macrosOutput = {
        };
        this.out = '';
    }
    TokenParserContext.prototype.write = function (data) {
        this.out += data;
    };
    TokenParserContext.prototype.captureOutput = function (callback) {
        var backOut = this.out;
        this.out = '';
        try  {
            callback();
            return this.out;
        }finally {
            this.out = backOut;
        }
    };
    TokenParserContext.prototype.setBlock = function (blockName, callback) {
        this.blocksOutput[blockName] = this.captureOutput(callback);
    };
    TokenParserContext.prototype.setMacro = function (macroName, callback) {
        this.macrosOutput[macroName] = this.captureOutput(callback);
    };
    return TokenParserContext;
})();
exports.TokenParserContext = TokenParserContext;
