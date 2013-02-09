///<reference path='../imports.d.ts'/>
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
        return this.blocksOutput[blockName] = this.captureOutput(callback);
    };
    TokenParserContext.prototype.setMacro = function (macroName, callback) {
        return this.macrosOutput[macroName] = this.captureOutput(callback);
    };
    return TokenParserContext;
})();
exports.TokenParserContext = TokenParserContext;
/*
addAsyncCallback(callback) {
this.asyncCallbacks.push(callback);
//throw(new Error("Not implemented yet!"));
}

executeLeftCallbacks(doneCallback) {
var that = this;
if (this.asyncCallbacks.length > 0) {
this.asyncCallbacks.shift()(function() {
that.executeLeftCallbacks(doneCallback);
});
} else {
doneCallback();
}
}
*/
//@ sourceMappingURL=TokenParserContext.js.map
