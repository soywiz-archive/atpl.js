var TokenParserContext = (function () {
    function TokenParserContext() {
        this.blocksOutput = {
        };
        this.currentBlockName = '__main';
        this.parentName = '';
    }
    TokenParserContext.prototype.write = function (data) {
        if(this.blocksOutput[this.currentBlockName] === undefined) {
            this.blocksOutput[this.currentBlockName] = '';
        }
        this.blocksOutput[this.currentBlockName] += data;
    };
    TokenParserContext.prototype.setBlock = function (newBlockName, callback) {
        var previousBlockName = this.currentBlockName;
        this.currentBlockName = newBlockName;
 {
            this.write('');
            callback();
        }
        this.currentBlockName = previousBlockName;
    };
    return TokenParserContext;
})();
exports.TokenParserContext = TokenParserContext;
