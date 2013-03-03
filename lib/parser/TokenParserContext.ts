///<reference path='../imports.d.ts'/>

import ParserNode = module('./ParserNode');

export class TokenParserContext {
	private blocksOutput: any = {};
	private macrosOutput: any = {};

	constructor() {
	}

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
}
