var Node = function() {
};
Node.prototype.output = function() {
	return '<invalid>';
};

var ExpressionParser = exports.ExpressionParser = function(tokenReader) {
	this.tokenReader = tokenReader;
};

ExpressionParser.prototype.parseExpression = function() {
};

exports.ExpressionParser = ExpressionParser;