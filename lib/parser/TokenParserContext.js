
var TokenParserContext = (function () {
    function TokenParserContext() {
        this.blocksOutput = {
        };
        this.macrosOutput = {
        };
    }
    TokenParserContext.prototype.iterateBlocks = function (callback) {
        for(var name in this.blocksOutput) {
            callback(this.blocksOutput[name], name);
        }
    };
    TokenParserContext.prototype.iterateMacros = function (callback) {
        for(var name in this.macrosOutput) {
            callback(this.macrosOutput[name], name);
        }
    };
    TokenParserContext.prototype.setBlock = function (blockName, node) {
        return this.blocksOutput[blockName] = node;
    };
    TokenParserContext.prototype.setMacro = function (macroName, node) {
        return this.macrosOutput[macroName] = node;
    };
    return TokenParserContext;
})();
exports.TokenParserContext = TokenParserContext;
