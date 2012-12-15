///<reference path='../imports.d.ts'/>

// http://docs.python.org/reference/expressions.html#summary
// https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence

export import ParserNode = module('./ParserNode');

export class ExpressionParser {
	constructor(public tokenReader) {
	}


	parseExpression() {
		return this.parseTernary();
	}

	parseTernary() {
		var left = this.parseLogicOr();
		if (this.tokenReader.peek().value == '?') {
			this.tokenReader.skip();
			var middle = this.parseExpression();
			this.tokenReader.expectAndMoveNext(':');
			var right = this.parseExpression();

			left = new ParserNode.ParserNodeTernaryOperation(left, middle, right);
		}
		return left;
	}

	parseLogicOr() {
		return this._parseBinary('parseLogicOr', this.parseLogicAnd, ['||']);
	}

	parseLogicAnd() {
		return this._parseBinary('parseLogicAnd', this.parseBitOr, ['&&']);
	}

	parseBitOr() {
		return this._parseBinary('parseBitOr', this.parseBitXor, ['|']);
	}

	parseBitXor() {
		return this._parseBinary('parseBitXor', this.parseBitAnd, ['^']);
	}

	parseBitAnd() {
		return this._parseBinary('parseBitAnd', this.parseCompare, ['&']);
	}

	parseCompare() {
		return this._parseBinary('parseCompare', this.parseAddSub, ['==', '!=', '>=', '<=', '>', '<', '===', '!==']);
	}

	parseAddSub() {
		return this._parseBinary('parseAddSub', this.parseMulDiv, ['+', '-']);
	}

	parseMulDiv() {
		return this._parseBinary('parseMulDiv', this.parseLiteralUnary, ['*', '/', '%']);
	};

	parseLiteralUnary() {
		var token = this.tokenReader.peek();
	
		// '(' <expression> ')'
		if (this.tokenReader.checkAndMoveNext('(')) {
			var subExpression = this.parseExpression();
			this.tokenReader.expectAndMoveNext(')');
			return subExpression;
		}

		// '[' [<expression> [',']] ']'
		if (this.tokenReader.checkAndMoveNext('[')) {
			var arrayNode = new ParserNode.ParserNodeArrayContainer();
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
			return new ParserNode.ParserNodeUnaryOperation(token.value, this.parseLiteralUnary());
		}
	
		// Numeric literal.
		if (token.type == 'number') {
			this.tokenReader.skip();
			return new ParserNode.ParserNodeLiteral(token.value);
		}
	
		return this.parseIdentifier();
	};

	parseIdentifier() {
		var token = this.tokenReader.peek();

		if (token.type == 'id') {
			this.tokenReader.skip();
			return new ParserNode.ParserNodeIdentifier(token.value);
		}
	
		throw(new Error("Unexpected token : " + JSON.stringify(token.value)));
	};


	_parseBinary(levelName, nextParseLevel, validOperators) {
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
			leftNode = new ParserNode.ParserNodeBinaryOperation(currentOperator, leftNode, rightNode);
		}

		return leftNode;
	}
}
