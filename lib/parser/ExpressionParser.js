var ParserNode = require('./ParserNode')

var ExpressionParser = (function () {
    function ExpressionParser(tokenReader) {
        this.tokenReader = tokenReader;
    }
    ExpressionParser.prototype.parseCommaExpression = function () {
        var expressions = [];
        while(true) {
            expressions.push(this.parseExpression());
            if(this.tokenReader.peek().value != ',') {
                break;
            }
            this.tokenReader.skip();
        }
        return new ParserNode.ParserNodeCommaExpression(expressions);
    };
    ExpressionParser.prototype.parseExpression = function () {
        return this.parseFunctionCall();
    };
    ExpressionParser.prototype.parseFunctionCall = function () {
        var expr = this.parseTernary();
        while(true) {
            if(this.tokenReader.peek().value == '(') {
                this.tokenReader.skip();
                var arguments;
                if(this.tokenReader.peek().value != ')') {
                    arguments = this.parseCommaExpression();
                } else {
                    arguments = new ParserNode.ParserNodeCommaExpression([]);
                }
                this.tokenReader.expectAndMoveNext(')');
                if(expr instanceof ParserNode.ParserNodeIdentifier) {
                    expr = new ParserNode.ParserNodeFunctionCall(new ParserNode.ParserNodeLiteral(expr.value), arguments);
                } else {
                    expr = new ParserNode.ParserNodeFunctionCall(expr, arguments);
                }
            } else {
                if(this.tokenReader.peek().value == '|') {
                    this.tokenReader.skip();
                    var filterName = this.tokenReader.peek().value;
                    this.tokenReader.skip();
                    var arguments = new ParserNode.ParserNodeCommaExpression([]);
                    if(this.tokenReader.peek().value == '(') {
                        this.tokenReader.skip();
                        if(this.tokenReader.peek().value != ')') {
                            arguments = this.parseCommaExpression();
                        }
                        this.tokenReader.expectAndMoveNext(')');
                    }
                    arguments.expressions.unshift(expr);
                    expr = new ParserNode.ParserNodeFilterCall(filterName, arguments);
                } else {
                    return expr;
                }
            }
        }
    };
    ExpressionParser.prototype.parseTernary = function () {
        var left = this.parseLogicOr();
        if(this.tokenReader.peek().value == '?') {
            this.tokenReader.skip();
            var middle = this.parseExpression();
            this.tokenReader.expectAndMoveNext(':');
            var right = this.parseExpression();
            left = new ParserNode.ParserNodeTernaryOperation(left, middle, right);
        }
        return left;
    };
    ExpressionParser.prototype.parseLogicOr = function () {
        return this._parseBinary('parseLogicOr', this.parseLogicAnd, [
            '||', 
            'or'
        ]);
    };
    ExpressionParser.prototype.parseLogicAnd = function () {
        return this._parseBinary('parseLogicAnd', this.parseCompare, [
            '&&', 
            'and'
        ]);
    };
    ExpressionParser.prototype.parseCompare = function () {
        return this._parseBinary('parseCompare', this.parseAddSub, [
            '==', 
            '!=', 
            '>=', 
            '<=', 
            '>', 
            '<', 
            '===', 
            '!=='
        ]);
    };
    ExpressionParser.prototype.parseAddSub = function () {
        return this._parseBinary('parseAddSub', this.parseMulDiv, [
            '+', 
            '-'
        ]);
    };
    ExpressionParser.prototype.parseMulDiv = function () {
        return this._parseBinary('parseMulDiv', this.parseLiteralUnary, [
            '*', 
            '/', 
            '%'
        ]);
    };
    ExpressionParser.prototype.parseLiteralUnary = function () {
        var token = this.tokenReader.peek();
        if(this.tokenReader.checkAndMoveNext('(')) {
            var subExpression = this.parseExpression();
            this.tokenReader.expectAndMoveNext(')');
            return subExpression;
        }
        if(this.tokenReader.checkAndMoveNext('[')) {
            var elements = [];
            while(true) {
                if(this.tokenReader.peek().value == ']') {
                    this.tokenReader.skip();
                    break;
                }
                elements.push(this.parseExpression());
                if(this.tokenReader.peek().value == ']') {
                    this.tokenReader.skip();
                    break;
                } else {
                    if(this.tokenReader.peek().value == ',') {
                        this.tokenReader.skip();
                    }
                }
            }
            return new ParserNode.ParserNodeArrayContainer(elements);
        }
        if([
            '-', 
            '+', 
            '~', 
            '!'
        ].indexOf(token.value) != -1) {
            this.tokenReader.skip();
            return new ParserNode.ParserNodeUnaryOperation(token.value, this.parseLiteralUnary());
        }
        if(token.type == 'number') {
            this.tokenReader.skip();
            return new ParserNode.ParserNodeLiteral(token.value);
        }
        return this.parseIdentifier();
    };
    ExpressionParser.prototype.parseIdentifier = function () {
        var token = this.tokenReader.peek();
        if(token.type == 'id') {
            this.tokenReader.skip();
            var identifierString = token.value;
            switch(identifierString) {
                case 'false': {
                    return new ParserNode.ParserNodeLiteral(false);

                }
                case 'true': {
                    return new ParserNode.ParserNodeLiteral(true);

                }
                case 'null': {
                    return new ParserNode.ParserNodeLiteral(null);

                }
                default: {
                    return new ParserNode.ParserNodeIdentifier(identifierString);

                }
            }
        }
        throw (new Error("Unexpected token : " + JSON.stringify(token.value)));
    };
    ExpressionParser.prototype._parseBinary = function (levelName, nextParseLevel, validOperators) {
        var leftNode = nextParseLevel.apply(this);
        var rightNode;
        var currentOperator;
        while(this.tokenReader.hasMore) {
            if(validOperators.indexOf(this.tokenReader.peek().value) != -1) {
                currentOperator = this.tokenReader.peek().value;
                this.tokenReader.skip();
            } else {
                break;
            }
            rightNode = nextParseLevel.apply(this);
            leftNode = new ParserNode.ParserNodeBinaryOperation(currentOperator, leftNode, rightNode);
        }
        return leftNode;
    };
    return ExpressionParser;
})();
exports.ExpressionParser = ExpressionParser;
