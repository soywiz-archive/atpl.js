///<reference path='../imports.d.ts'/>

import ParserNode = require('./ParserNode');
import RuntimeUtils = require('../runtime/RuntimeUtils');
import SandboxPolicy = require('../SandboxPolicy');

export class TokenParserContextCommon {
	sandbox: boolean = false;

	constructor(info: any = {}) {
		if (RuntimeUtils.isObject(info)) for (var key in info) this[key] = info[key];
	}

	serialize() {
		var ret = {};
		for (var key in this) ret[key] = this[key];
		return ret;
	}

	setSandbox(callback: () => void ) {
		this.sandbox = true;
		try {
			callback();
		} finally {
			this.sandbox = false;
		}
	}
}

export class TokenParserContext {
	private blocksOutput: any = {};
	private macrosOutput: any = {};
	afterMainNodes: ParserNode.ParserNode[] = [];

	constructor(public common: TokenParserContextCommon, public sandboxPolicy: SandboxPolicy) {
	}

	iterateBlocks(callback: (node: ParserNode.ParserNode, name: string) => void) {
		for (var name in this.blocksOutput) callback(this.blocksOutput[name], name);
	}

	iterateMacros(callback: (node: ParserNode.ParserNode, name: string) => void ) {
		for (var name in this.macrosOutput) callback(this.macrosOutput[name], name);
	}

	iterateAfterMainNodes(callback: (node: ParserNode.ParserNode) => void ) {
		this.afterMainNodes.forEach(callback);
	}

	setBlock(blockName, node: ParserNode.ParserNode) {
		return this.blocksOutput[blockName] = node;
	}

	setMacro(macroName, node: ParserNode.ParserNode) {
		return this.macrosOutput[macroName] = node;
	}

	addAfterMainNode(node: ParserNode.ParserNode) {
		this.afterMainNodes.push(node);
	}
}
