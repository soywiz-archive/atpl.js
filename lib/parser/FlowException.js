var FlowException = function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
	this.blockType             = blockType;
	this.templateParser        = templateParser;
	this.tokenParserContext    = tokenParserContext;
	this.templateTokenReader   = templateTokenReader;
	this.expressionTokenReader = expressionTokenReader;
};

FlowException.prototype.__proto__ = Error.prototype;

exports.FlowException = FlowException;