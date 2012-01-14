var TokenParserContext = function() {
	this.blocksOutput = {};
	this.asyncCallbacks = [];
	this.currentBlockName = '__main';
	this.parentName = '';
};

TokenParserContext.prototype.write = function(data) {
	if (this.blocksOutput[this.currentBlockName] === undefined) this.blocksOutput[this.currentBlockName] = '';
	this.blocksOutput[this.currentBlockName] += data;
};

TokenParserContext.prototype.setBlock = function(newBlockName, callback) {
	var previousBlockName = this.currentBlockName;
	this.currentBlockName = newBlockName;
	{
		callback();
	}
	this.currentBlockName = previousBlockName;
};

TokenParserContext.prototype.addAsyncCallback = function(callback) {
	this.asyncCallbacks.push(callback);
	//throw(new Error("Not implemented yet!"));
};

TokenParserContext.prototype.executeLeftCallbacks = function(doneCallback) {
	var that = this;
	if (this.asyncCallbacks.length > 0) {
		this.asyncCallbacks.shift()(function() {
			that.executeLeftCallbacks(doneCallback);
		});
	} else {
		doneCallback();
	}
};

exports.TokenParserContext = TokenParserContext;