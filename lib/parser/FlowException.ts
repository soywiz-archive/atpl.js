///<reference path='../imports.d.ts'/>

//export class FlowException extends Error {
//	constructor(public blockType, public templateParser, public tokenParserContext, public templateTokenReader, public expressionTokenReader) {
//		super();
//	}
//}

export var FlowException = function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
	this.blockType             = blockType;
	this.templateParser        = templateParser;
	this.tokenParserContext    = tokenParserContext;
	this.templateTokenReader   = templateTokenReader;
	this.expressionTokenReader = expressionTokenReader;
};

FlowException.prototype['__proto__'] = Error.prototype;
