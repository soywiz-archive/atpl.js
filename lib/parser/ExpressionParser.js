// http://docs.python.org/reference/expressions.html#summary
// https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence

ParserNode                = require('./ParserNode.js').ParserNode;
ParserNodeUnaryOperation  = require('./ParserNode.js').ParserNodeUnaryOperation;
ParserNodeBinaryOperation = require('./ParserNode.js').ParserNodeBinaryOperation;
ParserNodeLiteral         = require('./ParserNode.js').ParserNodeLiteral;
ParserNodeIdentifier      = require('./ParserNode.js').ParserNodeIdentifier;
ParserNodeArrayContainer  = require('./ParserNode.js').ParserNodeArrayContainer;

var ExpressionParser = exports.ExpressionParser = function(tokenReader) {
	this.tokenReader = tokenReader;
};

ExpressionParser.prototype.parseExpression = function() {
	return this.parseTernary();
};

ExpressionParser.prototype.parseTernary = function() {
	var left = this.parseLogicOr();
	if (this.tokenReader.peek().value == '?') {
		this.tokenReader.skip();
		var middle = this.parseExpression();
		this.tokenReader.expectAndMoveNext(':');
		var right = this.parseExpression();

		left = new ParserNodeTernaryOperation(left, middle, right);
	}
	return left;
};

ExpressionParser.prototype.parseLogicOr = function() {
	return this._parseBinary('parseLogicOr', this.parseLogicAnd, ['||']);
}

ExpressionParser.prototype.parseLogicAnd = function() {
	return this._parseBinary('parseLogicAnd', this.parseBitOr, ['&&']);
}

ExpressionParser.prototype.parseBitOr = function() {
	return this._parseBinary('parseBitOr', this.parseBitXor, ['|']);
}

ExpressionParser.prototype.parseBitXor = function() {
	return this._parseBinary('parseBitXor', this.parseBitAnd, ['^']);
}

ExpressionParser.prototype.parseBitAnd = function() {
	return this._parseBinary('parseBitAnd', this.parseCompare, ['&']);
}

ExpressionParser.prototype.parseCompare = function() {
	return this._parseBinary('parseCompare', this.parseAddSub, ['==', '!=', '>=', '<=', '>', '<', '===', '!==']);
}

ExpressionParser.prototype.parseAddSub = function() {
	return this._parseBinary('parseAddSub', this.parseMulDiv, ['+', '-']);
}

ExpressionParser.prototype.parseMulDiv = function() {
	return this._parseBinary('parseMulDiv', this.parseLiteralUnary, ['*', '/', '%']);
};

ExpressionParser.prototype.parseLiteralUnary = function() {
	var token = this.tokenReader.peek();
	
	// '(' <expression> ')'
	if (this.tokenReader.checkAndMoveNext('(')) {
		var subExpression = this.parseExpression();
		this.tokenReader.expectAndMoveNext(')');
		return subExpression;
	}

	// '[' [<expression> [',']] ']'
	if (this.tokenReader.checkAndMoveNext('[')) {
		var arrayNode = new ParserNodeArrayContainer();
		while (true) {
			if (this.tokenReader.peek().value == ']') {
				this.tokenReader.skip();
				break;
			}
			arrayNode.add(this.parseExpression());
			if (this.tokenReader.peek().value == ']') {
				this.tokenReader.skip();
				break;
			} else if (this.tokenReader.peek().value == ',') {
				this.tokenReader.skip();
			}
		}
		return arrayNode;
	}

	// Unary operator.
	if (['-', '+', '~', '!'].indexOf(token.value) != -1) {
		this.tokenReader.skip();
		return new ParserNodeUnaryOperation(token.value, this.parseLiteralUnary());
	}
	
	// Numeric literal.
	if (token.type == 'number') {
		this.tokenReader.skip();
		return new ParserNodeLiteral(token.value);
	}
	
	return this.parseIdentifier();
};

ExpressionParser.prototype.parseIdentifier = function() {
	var token = this.tokenReader.peek();

	if (token.type == 'id') {
		this.tokenReader.skip();
		return new ParserNodeIdentifier(token.value);
	}
	
	throw(new Error("Unexpected token : " + JSON.stringify(token.value)));
};


ExpressionParser.prototype._parseBinary = function(levelName, nextParseLevel, validOperators) {
	var leftNode = nextParseLevel.apply(this);
	var rightNode;
	var currentOperator;

	while (this.tokenReader.hasMore()) {
		if (validOperators.indexOf(this.tokenReader.peek().value) != -1) {
			currentOperator = this.tokenReader.peek().value;
			this.tokenReader.skip();
		} else {
			break;
		}

		rightNode = nextParseLevel.apply(this);
		leftNode = new ParserNodeBinaryOperation(currentOperator, leftNode, rightNode);
	}

	return leftNode;
};


exports.ExpressionParser = ExpressionParser;