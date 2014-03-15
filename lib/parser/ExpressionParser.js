///<reference path='../imports.d.ts'/>
// http://docs.python.org/reference/expressions.html#summary
// https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
var ParserNode = require('./ParserNode');

var StringReader = require('../lexer/StringReader');
var ExpressionTokenizer = require('../lexer/ExpressionTokenizer');
var TokenReader = require('../lexer/TokenReader');

var ExpressionParser = (function () {
    function ExpressionParser(tokenReader, tokenParserContext) {
        this.tokenReader = tokenReader;
        this.tokenParserContext = tokenParserContext;
        //if (!(this.tokenParserContext instanceof TokenParserContext.TokenParserContext)) { console.log(this.tokenParserContext); throw (new Error("ASSERT!")); }
    }
    ExpressionParser.prototype.parseCommaExpression = function () {
        var expressions = [];
        while (true) {
            expressions.push(this.parseExpression());
            if (this.tokenReader.peek().value != ',')
                break;
            this.tokenReader.skip();
        }
        return new ParserNode.ParserNodeCommaExpression(expressions);
    };

    ExpressionParser.prototype.parseCommaExpressionWithNames = function () {
        var expressions = [];
        var namedCount = 0;
        var names = [];
        while (true) {
            if (this.tokenReader.peek(1).value == '=') {
                names.push(this.parseIdentifierOnly().value);
                namedCount++;
                this.tokenReader.skip();
            } else {
                names.push(null);
            }
            expressions.push(this.parseExpression());
            if (this.tokenReader.peek().value != ',')
                break;
            this.tokenReader.skip();
        }
        return new ParserNode.ParserNodeCommaExpression(expressions, (namedCount > 0) ? names : null);
    };

    ExpressionParser.prototype.parseExpression = function () {
        return this.parseFunctionCall();
    };

    ExpressionParser.prototype.parseFunctionCall = function () {
        return this.parseTernary();
    };

    ExpressionParser.prototype.parseTernary = function () {
        var left = this.parseTernaryShortcut();
        if (this.tokenReader.peek().value == '?') {
            this.tokenReader.skip();
            var middle = this.parseExpression();
            this.tokenReader.expectAndMoveNext([':']);
            var right = this.parseExpression();

            left = new ParserNode.ParserNodeTernaryOperation(left, middle, right);
        }
        return left;
    };

    ExpressionParser.prototype.parseTernaryShortcut = function () {
        return this._parseBinary('parseTernaryShortcut', this.parseLogicOr, ['?:']);
    };
    ExpressionParser.prototype.parseLogicOr = function () {
        return this._parseBinary('parseLogicOr', this.parseLogicAnd, ['||', 'or']);
    };
    ExpressionParser.prototype.parseLogicAnd = function () {
        return this._parseBinary('parseLogicAnd', this.parseBitOr, ['&&', 'and']);
    };
    ExpressionParser.prototype.parseBitOr = function () {
        return this._parseBinary('parseBitOr', this.parseBitXor, ['b-or']);
    };
    ExpressionParser.prototype.parseBitXor = function () {
        return this._parseBinary('parseBitXor', this.parseBitAnd, ['b-xor']);
    };
    ExpressionParser.prototype.parseBitAnd = function () {
        return this._parseBinary('parseBitAnd', this.parseCompare, ['b-and']);
    };
    ExpressionParser.prototype.parseCompare = function () {
        return this._parseBinary('parseCompare', this.parseAddSub, ['==', '!=', '>=', '<=', '>', '<', '===', '!==', 'is not', 'not in', 'is', 'in']);
    };
    ExpressionParser.prototype.parseAddSub = function () {
        return this._parseBinary('parseAddSub', this.parseMulDiv, ['+', '-']);
    };
    ExpressionParser.prototype.parseMulDiv = function () {
        return this._parseBinary('parseMulDiv', this.parsePow, ['*', '/', '//', '%']);
    };
    ExpressionParser.prototype.parsePow = function () {
        return this._parseBinary('parsePow', this.parseString, ['**']);
    };
    ExpressionParser.prototype.parseString = function () {
        return this._parseBinary('parseString', this.parseLiteralUnary, ['~', '..']);
    };

    ExpressionParser.prototype.parseLiteralUnary = function () {
        var token = this.tokenReader.peek();
        var expr = undefined;

        // '(' <expression> ')'
        if (this.tokenReader.checkAndMoveNext(['('])) {
            var subExpression = this.parseExpression();
            this.tokenReader.expectAndMoveNext([')']);
            expr = subExpression;
        } else if (this.tokenReader.checkAndMoveNext(['['])) {
            var arrayElements = [];
            while (true) {
                if (this.tokenReader.peek().value == ']') {
                    this.tokenReader.skip();
                    break;
                }
                arrayElements.push(this.parseExpression());
                if (this.tokenReader.peek().value == ']') {
                    this.tokenReader.skip();
                    break;
                } else if (this.tokenReader.peek().value == ',') {
                    this.tokenReader.skip();
                }
            }
            expr = new ParserNode.ParserNodeArrayContainer(arrayElements);
        } else if (this.tokenReader.checkAndMoveNext(['{'])) {
            var objectElements = [];
            while (true) {
                if (this.tokenReader.peek().value == '}') {
                    this.tokenReader.skip();
                    break;
                }
                var key = this.parseExpression();
                this.tokenReader.expectAndMoveNext([':']);
                var value = this.parseExpression();
                objectElements.push(new ParserNode.ParserNodeObjectItem(key, value));

                if (this.tokenReader.peek().value == ']') {
                    this.tokenReader.skip();
                    break;
                } else if (this.tokenReader.peek().value == ',') {
                    this.tokenReader.skip();
                }
            }
            expr = new ParserNode.ParserNodeObjectContainer(objectElements);
        } else if (['-', '+', '~', '!', 'not'].indexOf(token.value) != -1) {
            this.tokenReader.skip();
            expr = new ParserNode.ParserNodeUnaryOperation(token.value, this.parseLiteralUnary());
        } else if (token.type == 'number' || token.type == 'string') {
            this.tokenReader.skip();

            expr = null;

            if (token.type == 'string' && token.rawValue.substr(0, 1) == '"') {
                var regexp = /\#\{[^\}]*\}/g;
                var parts2 = token.value.split(regexp);
                var matches = token.value.match(regexp);
                if (matches && parts2) {
                    for (var n = 0; n < parts2.length; n++) {
                        var p1 = new ParserNode.ParserNodeLiteral(parts2[n]);
                        if (expr == null) {
                            expr = p1;
                        } else {
                            expr = new ParserNode.ParserNodeBinaryOperation('~', expr, p1);
                        }
                        if (n < matches.length) {
                            var expressionString = matches[n].substr(2, matches[n].length - 2 - 1);
                            expr = new ParserNode.ParserNodeBinaryOperation('~', expr, new ExpressionParser(new TokenReader(new ExpressionTokenizer.ExpressionTokenizer(new StringReader(expressionString))), this.tokenParserContext).parseExpression());
                        }
                    }
                    //console.log(parts);
                    //console.log(matches);
                }
            }

            if (expr == null) {
                expr = new ParserNode.ParserNodeLiteral(token.value);
            }
        } else {
            expr = this.parseIdentifier();
        }

        while (true) {
            // Function call
            if (this.tokenReader.peek().value == '(') {
                this.tokenReader.skip();
                var arguments;
                if (this.tokenReader.peek().value != ')') {
                    arguments = this.parseCommaExpressionWithNames();
                } else {
                    arguments = new ParserNode.ParserNodeCommaExpression([]);
                }
                this.tokenReader.expectAndMoveNext([')']);
                if (expr instanceof ParserNode.ParserNodeIdentifier) {
                    var functionName = expr.value;

                    if (this.tokenParserContext.common.sandbox) {
                        if (this.tokenParserContext.sandboxPolicy.allowedFunctions.indexOf(functionName) == -1)
                            throw (new Error("SandboxPolicy disallows function '" + functionName + "'"));
                    }

                    expr = new ParserNode.ParserNodeFunctionCall(new ParserNode.ParserNodeLiteral(functionName), arguments);
                } else {
                    expr = new ParserNode.ParserNodeFunctionCall(expr, arguments);
                }
            }

            // Array access/slicing
            if (this.tokenReader.peek().value == '[') {
                this.tokenReader.skip();
                var parts = [];

                // Slicing without first expression
                if (this.tokenReader.peek().value == ':') {
                    this.tokenReader.skip();
                    parts.push(new ParserNode.ParserNodeLiteral(undefined));
                }

                parts.push(this.parseExpression());

                // Slicing with at least first expression
                if (this.tokenReader.peek().value == ':') {
                    this.tokenReader.skip();
                    if (parts.length != 1)
                        throw (new Error("Unexpected ':' again"));
                    if (this.tokenReader.peek().value == ']') {
                        this.tokenReader.skip();
                        parts.push(new ParserNode.ParserNodeLiteral(undefined));
                    } else {
                        parts.push(this.parseExpression());
                        this.tokenReader.expectAndMoveNext([']']);
                    }
                } else {
                    this.tokenReader.expectAndMoveNext([']']);
                }

                if (parts.length == 1) {
                    expr = new ParserNode.ParserNodeArrayAccess(expr, parts[0]);
                } else {
                    expr = new ParserNode.ParserNodeArraySlice(expr, parts[0], parts[1]);
                }
            }

            // Field access
            if (this.tokenReader.peek().value == '.') {
                this.tokenReader.skip();
                var fieldName = this.tokenReader.peek().value;
                this.tokenReader.skip();
                expr = new ParserNode.ParserNodeArrayAccess(expr, new ParserNode.ParserNodeLiteral(fieldName));
            } else if (this.tokenReader.peek().value == '|') {
                this.tokenReader.skip();
                var filterName = this.tokenReader.peek().value;
                this.tokenReader.skip();

                var arguments = new ParserNode.ParserNodeCommaExpression([]);

                if (this.tokenReader.peek().value == '(') {
                    this.tokenReader.skip();
                    if (this.tokenReader.peek().value != ')') {
                        arguments = this.parseCommaExpression();
                    }
                    this.tokenReader.expectAndMoveNext([')']);
                }

                arguments.expressions.unshift(expr);

                if (this.tokenParserContext.common.sandbox) {
                    if (this.tokenParserContext.sandboxPolicy.allowedFilters.indexOf(filterName) == -1)
                        throw (new Error("SandboxPolicy disallows filter '" + filterName + "'"));
                }
                expr = new ParserNode.ParserNodeFilterCall(filterName, arguments);
            } else {
                return expr;
            }
        }
    };

    ExpressionParser.prototype.parseStringLiteral = function () {
        var token = this.tokenReader.peek();

        if (token.type == 'string') {
            this.tokenReader.skip();
            return new ParserNode.ParserNodeLiteral(token.value);
        }

        throw (new Error("Unexpected token : " + JSON.stringify(token.value) + " type:'" + token.type + "'"));
    };

    ExpressionParser.prototype.parseIdentifierCommaList = function () {
        var identifiers = [];
        while (true) {
            identifiers.push(this.parseIdentifier());
            if (this.tokenReader.checkAndMoveNext([',']) === undefined)
                break;
        }
        return identifiers;
    };

    ExpressionParser.prototype.parseIdentifierOnly = function () {
        var token = this.tokenReader.peek();

        if (token.type == 'id') {
            this.tokenReader.skip();
            var identifierString = token.value;

            return new ParserNode.ParserNodeIdentifier(identifierString);
        }

        throw (new Error("Unexpected token : " + JSON.stringify(token.value) + " type:'" + token.type + "'"));
    };

    ExpressionParser.prototype.parseIdentifier = function () {
        var token = this.tokenReader.peek();

        if (token.type == 'id') {
            this.tokenReader.skip();
            var identifierString = token.value;

            switch (identifierString) {
                case 'false':
                    return new ParserNode.ParserNodeLiteral(false);
                case 'true':
                    return new ParserNode.ParserNodeLiteral(true);
                case 'null':
                    return new ParserNode.ParserNodeLiteral(null);
                case 'undefined':
                    return new ParserNode.ParserNodeLiteral(undefined);
                default:
                    return new ParserNode.ParserNodeIdentifier(identifierString);
            }
        }

        throw (new Error("Unexpected token : " + JSON.stringify(token.value) + " type:'" + token.type + "'"));
    };

    ExpressionParser.prototype._parseBinary = function (levelName, nextParseLevel, validOperators) {
        var leftNode = nextParseLevel.apply(this);
        var rightNode;
        var currentOperator;

        while (this.tokenReader.hasMore()) {
            if ((currentOperator = this.tokenReader.checkAndMoveNextMultiToken(validOperators)) === undefined)
                break;

            rightNode = nextParseLevel.apply(this);
            leftNode = new ParserNode.ParserNodeBinaryOperation(currentOperator, leftNode, rightNode);
        }

        return leftNode;
    };
    return ExpressionParser;
})();

module.exports = ExpressionParser;
