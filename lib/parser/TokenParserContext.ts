///<reference path='../imports.d.ts'/>

import ParserNode = module('./ParserNode');

export class TokenParserContext {
	private blocksOutput: any = {};
	private macrosOutput: any = {};

	constructor() {
	}

	/*
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
	*/

	iterateBlocks(callback: (node: ParserNode.ParserNode, name: string) => void) {
		for (var name in this.blocksOutput) callback(this.blocksOutput[name], name);
	}

	iterateMacros(callback: (node: ParserNode.ParserNode, name: string) => void ) {
		for (var name in this.macrosOutput) callback(this.macrosOutput[name], name);
	}

	setBlock(blockName, node: ParserNode.ParserNode) {
		return this.blocksOutput[blockName] = node;
	}

	setMacro(macroName, node: ParserNode.ParserNode) {
		return this.macrosOutput[macroName] = node;
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
