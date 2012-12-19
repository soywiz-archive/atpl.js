///<reference path='../imports.d.ts'/>

export class TokenParserContext {
	blocksOutput: any = {};
	macrosOutput: any = {};

	constructor() {
	}

	private out: string = '';

	write(data: string) {
		this.out += data;
	}

	captureOutput(callback) {
		var backOut = this.out;
		this.out = '';
		try {
			callback();
			return this.out;
		} finally {
			this.out = backOut;
		}
	}

	setBlock(blockName, callback) {
		this.blocksOutput[blockName] = this.captureOutput(callback);
	}

	setMacro(macroName, callback) {
		this.macrosOutput[macroName] = this.captureOutput(callback);
	}

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
