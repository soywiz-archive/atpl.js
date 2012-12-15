///<reference path='../imports.d.ts'/>

export class TokenParserContext {
	blocksOutput;
	currentBlockName;
	parentName;

	constructor() {
		this.blocksOutput = {};
		//this.asyncCallbacks = [];
		this.currentBlockName = '__main';
		this.parentName = '';
	};

	write(data) {
		if (this.blocksOutput[this.currentBlockName] === undefined) this.blocksOutput[this.currentBlockName] = '';
		this.blocksOutput[this.currentBlockName] += data;
	};

	setBlock(newBlockName, callback) {
		var previousBlockName = this.currentBlockName;
		this.currentBlockName = newBlockName;
		{
			callback();
		}
		this.currentBlockName = previousBlockName;
	};

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
}
