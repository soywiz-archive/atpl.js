var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ParserNode = (function () {
    function ParserNode() {
        this.type = '-';
    }
    ParserNode.prototype.generateCode = function () {
        return '<invalid>';
    };
    ParserNode.prototype.optimize = function () {
        return this;
    };
    return ParserNode;
})();
exports.ParserNode = ParserNode;
var ParserNodeExpression = (function (_super) {
    __extends(ParserNodeExpression, _super);
    function ParserNodeExpression() {
        _super.apply(this, arguments);

    }
    return ParserNodeExpression;
})(ParserNode);
exports.ParserNodeExpression = ParserNodeExpression;
var ParserNodeWriteExpression = (function (_super) {
    __extends(ParserNodeWriteExpression, _super);
    function ParserNodeWriteExpression(expression) {
        _super.call(this);
        this.expression = expression;
    }
    ParserNodeWriteExpression.prototype.generateCode = function () {
        return 'runtimeContext.writeExpression(' + this.expression.generateCode() + ');';
    };
    return ParserNodeWriteExpression;
})(ParserNode);
exports.ParserNodeWriteExpression = ParserNodeWriteExpression;
var ParserNodeContainer = (function (_super) {
    __extends(ParserNodeContainer, _super);
    function ParserNodeContainer(nodes) {
        if (typeof nodes === "undefined") { nodes = null; }
        _super.call(this);
        this.nodes = nodes;
        this.type = 'ParserNodeContainer';
        if(this.nodes == null) {
            this.nodes = [];
        }
    }
    ParserNodeContainer.prototype.add = function (node) {
        this.nodes.push(node);
    };
    ParserNodeContainer.prototype.generateCode = function () {
        var output = '';
        for(var n in this.nodes) {
            output += this.nodes[n].generateCode();
        }
        return output;
    };
    return ParserNodeContainer;
})(ParserNode);
exports.ParserNodeContainer = ParserNodeContainer;
var ParserNodeObjectItem = (function (_super) {
    __extends(ParserNodeObjectItem, _super);
    function ParserNodeObjectItem(key, value) {
        _super.call(this);
        this.key = key;
        this.value = value;
        this.type = 'ParserNodeObjectItem';
    }
    ParserNodeObjectItem.prototype.generateCode = function () {
        return this.key.generateCode() + ' : ' + this.value.generateCode();
    };
    return ParserNodeObjectItem;
})(ParserNode);
exports.ParserNodeObjectItem = ParserNodeObjectItem;
var ParserNodeObjectContainer = (function (_super) {
    __extends(ParserNodeObjectContainer, _super);
    function ParserNodeObjectContainer(items) {
        _super.call(this);
        this.items = items;
        this.type = 'ParserNodeObjectContainer';
    }
    ParserNodeObjectContainer.prototype.generateCode = function () {
        return '{' + this.items.map(function (node) {
            return node.generateCode();
        }).join(', ') + '}';
    };
    return ParserNodeObjectContainer;
})(ParserNodeExpression);
exports.ParserNodeObjectContainer = ParserNodeObjectContainer;
var ParserNodeArrayContainer = (function (_super) {
    __extends(ParserNodeArrayContainer, _super);
    function ParserNodeArrayContainer(items) {
        _super.call(this);
        this.items = items;
        this.type = 'ParserNodeArrayContainer';
    }
    ParserNodeArrayContainer.prototype.generateCode = function () {
        return '[' + this.items.map(function (node) {
            return node.generateCode();
        }).join(', ') + ']';
    };
    return ParserNodeArrayContainer;
})(ParserNodeExpression);
exports.ParserNodeArrayContainer = ParserNodeArrayContainer;
var ParserNodeLiteral = (function (_super) {
    __extends(ParserNodeLiteral, _super);
    function ParserNodeLiteral(value) {
        _super.call(this);
        this.value = value;
        this.type = 'ParserNodeLiteral';
    }
    ParserNodeLiteral.prototype.generateCode = function () {
        return JSON.stringify(this.value);
    };
    return ParserNodeLiteral;
})(ParserNodeExpression);
exports.ParserNodeLiteral = ParserNodeLiteral;
var ParserNodeLeftValue = (function (_super) {
    __extends(ParserNodeLeftValue, _super);
    function ParserNodeLeftValue() {
        _super.apply(this, arguments);

        this.type = 'ParserNodeLeftValue';
    }
    ParserNodeLeftValue.prototype.generateAssign = function (expr) {
        throw (new Error("Must implement"));
    };
    return ParserNodeLeftValue;
})(ParserNodeExpression);
exports.ParserNodeLeftValue = ParserNodeLeftValue;
var ParserNodeIdentifier = (function (_super) {
    __extends(ParserNodeIdentifier, _super);
    function ParserNodeIdentifier(value) {
        _super.call(this);
        this.value = value;
        this.type = 'ParserNodeIdentifier';
    }
    ParserNodeIdentifier.prototype.generateAssign = function (expr) {
        return 'runtimeContext.scopeSet(' + JSON.stringify(this.value) + ', ' + expr.generateCode() + ')';
    };
    ParserNodeIdentifier.prototype.generateCode = function () {
        return 'runtimeContext.scopeGet(' + JSON.stringify(this.value) + ')';
    };
    return ParserNodeIdentifier;
})(ParserNodeLeftValue);
exports.ParserNodeIdentifier = ParserNodeIdentifier;
var ParserNodeStatement = (function (_super) {
    __extends(ParserNodeStatement, _super);
    function ParserNodeStatement() {
        _super.apply(this, arguments);

        this.type = 'ParserNodeStatement';
    }
    return ParserNodeStatement;
})(ParserNode);
exports.ParserNodeStatement = ParserNodeStatement;
var ParserNodeRaw = (function (_super) {
    __extends(ParserNodeRaw, _super);
    function ParserNodeRaw(value) {
        _super.call(this);
        this.value = value;
        this.type = 'ParserNodeRaw';
    }
    ParserNodeRaw.prototype.generateCode = function () {
        return this.value;
    };
    return ParserNodeRaw;
})(ParserNodeExpression);
exports.ParserNodeRaw = ParserNodeRaw;
var ParserNodeStatementExpression = (function (_super) {
    __extends(ParserNodeStatementExpression, _super);
    function ParserNodeStatementExpression(expression) {
        _super.call(this);
        this.expression = expression;
        this.type = 'ParserNodeStatementExpression';
    }
    ParserNodeStatementExpression.prototype.generateCode = function () {
        return this.expression.generateCode() + ';';
    };
    return ParserNodeStatementExpression;
})(ParserNodeStatement);
exports.ParserNodeStatementExpression = ParserNodeStatementExpression;
var ParserNodeAssignment = (function (_super) {
    __extends(ParserNodeAssignment, _super);
    function ParserNodeAssignment(leftValue, rightValue) {
        _super.call(this);
        this.leftValue = leftValue;
        this.rightValue = rightValue;
        this.type = 'ParserNodeAssignment';
    }
    ParserNodeAssignment.prototype.generateCode = function () {
        return this.leftValue.generateAssign(this.rightValue);
    };
    return ParserNodeAssignment;
})(ParserNodeExpression);
exports.ParserNodeAssignment = ParserNodeAssignment;
var ParserNodeCommaExpression = (function (_super) {
    __extends(ParserNodeCommaExpression, _super);
    function ParserNodeCommaExpression(expressions) {
        _super.call(this);
        this.expressions = expressions;
        this.type = 'ParserNodeCommaExpression';
    }
    ParserNodeCommaExpression.prototype.generateCode = function () {
        return this.expressions.map(function (item) {
            return item.generateCode();
        }).join(', ');
    };
    return ParserNodeCommaExpression;
})(ParserNode);
exports.ParserNodeCommaExpression = ParserNodeCommaExpression;
var ParserNodeArrayAccess = (function (_super) {
    __extends(ParserNodeArrayAccess, _super);
    function ParserNodeArrayAccess(object, key) {
        _super.call(this);
        this.object = object;
        this.key = key;
        this.type = 'ParserNodeArrayAccess';
    }
    ParserNodeArrayAccess.prototype.generateCode = function () {
        return 'runtimeContext.access(' + this.object.generateCode() + ', ' + this.key.generateCode() + ')';
    };
    return ParserNodeArrayAccess;
})(ParserNodeExpression);
exports.ParserNodeArrayAccess = ParserNodeArrayAccess;
var ParserNodeArraySlice = (function (_super) {
    __extends(ParserNodeArraySlice, _super);
    function ParserNodeArraySlice(object, left, right) {
        _super.call(this);
        this.object = object;
        this.left = left;
        this.right = right;
        this.type = 'ParserNodeArraySlice';
    }
    ParserNodeArraySlice.prototype.generateCode = function () {
        return 'runtimeContext.slice(' + this.object.generateCode() + ', ' + this.left.generateCode() + ', ' + this.right.generateCode() + ')';
    };
    return ParserNodeArraySlice;
})(ParserNodeExpression);
exports.ParserNodeArraySlice = ParserNodeArraySlice;
var ParserNodeFunctionCall = (function (_super) {
    __extends(ParserNodeFunctionCall, _super);
    function ParserNodeFunctionCall(functionExpr, arguments) {
        _super.call(this);
        this.functionExpr = functionExpr;
        this.arguments = arguments;
        this.type = 'ParserNodeFunctionCall';
    }
    ParserNodeFunctionCall.prototype.generateCode = function () {
        if(this.functionExpr instanceof ParserNodeArrayAccess) {
            var arrayAccess = this.functionExpr;
            return 'runtimeContext.callContext(' + arrayAccess.object.generateCode() + ', ' + arrayAccess.key.generateCode() + ', [' + this.arguments.generateCode() + '])';
        } else {
            return 'runtimeContext.call(' + this.functionExpr.generateCode() + ', [' + this.arguments.generateCode() + '])';
        }
    };
    return ParserNodeFunctionCall;
})(ParserNodeExpression);
exports.ParserNodeFunctionCall = ParserNodeFunctionCall;
var ParserNodeFilterCall = (function (_super) {
    __extends(ParserNodeFilterCall, _super);
    function ParserNodeFilterCall(filterName, arguments) {
        _super.call(this);
        this.filterName = filterName;
        this.arguments = arguments;
        this.type = 'ParserNodeFilterCall';
    }
    ParserNodeFilterCall.prototype.generateCode = function () {
        return 'runtimeContext.filter(' + JSON.stringify(this.filterName) + ', [' + this.arguments.generateCode() + '])';
    };
    return ParserNodeFilterCall;
})(ParserNodeExpression);
exports.ParserNodeFilterCall = ParserNodeFilterCall;
var ParserNodeUnaryOperation = (function (_super) {
    __extends(ParserNodeUnaryOperation, _super);
    function ParserNodeUnaryOperation(operator, right) {
        _super.call(this);
        this.operator = operator;
        this.right = right;
        this.type = 'ParserNodeUnaryOperation';
    }
    ParserNodeUnaryOperation.prototype.generateCode = function () {
        switch(this.operator) {
            case 'not':
                return '!(' + this.right.generateCode() + ')';
            default:
                return this.operator + '(' + this.right.generateCode() + ')';
        }
    };
    return ParserNodeUnaryOperation;
})(ParserNodeExpression);
exports.ParserNodeUnaryOperation = ParserNodeUnaryOperation;
var ParserNodeBinaryOperation = (function (_super) {
    __extends(ParserNodeBinaryOperation, _super);
    function ParserNodeBinaryOperation(operator, left, right) {
        _super.call(this);
        this.operator = operator;
        this.left = left;
        this.right = right;
        this.type = 'ParserNodeBinaryOperation';
    }
    ParserNodeBinaryOperation.prototype.generateCode = function () {
        switch(this.operator) {
            case 'b-or':
                return '("" + ' + this.left.generateCode() + ' | ' + this.right.generateCode() + ')';
            case 'b-and':
                return '("" + ' + this.left.generateCode() + ' & ' + this.right.generateCode() + ')';
            case 'b-xor':
                return '("" + ' + this.left.generateCode() + ' ^ ' + this.right.generateCode() + ')';
            case '~':
                return '("" + ' + this.left.generateCode() + ' + ' + this.right.generateCode() + ')';
            case '..':
                return 'runtimeContext.range(' + this.left.generateCode() + ', ' + this.right.generateCode() + ')';
            case '?:':
                return 'runtimeContext.ternaryShortcut(' + this.left.generateCode() + ', ' + this.right.generateCode() + ')';
            case '//':
                return 'Math.floor(' + this.left.generateCode() + ' / ' + this.right.generateCode() + ')';
            case '**':
                return 'Math.pow(' + this.left.generateCode() + ',' + this.right.generateCode() + ')';
            case 'not in':
            case 'in':
                var ret = 'runtimeContext.inArray(' + this.left.generateCode() + ',' + this.right.generateCode() + ')';
                if((this.operator == 'not in')) {
                    ret = '!(' + ret + ')';
                }
                return ret;
            case 'is':
            case 'is not':
                var ret = '';
                var left = this.left;
                var right = this.right;
                if(this.right instanceof ParserNodeUnaryOperation) {
                    right = this.right.right;
                }
                if(right instanceof ParserNodeFunctionCall) {
                    ret = 'runtimeContext.test(' + (right).functionExpr.generateCode() + ', [' + left.generateCode() + ',' + (right).arguments.generateCode() + '])';
                } else if(right instanceof ParserNodeIdentifier) {
                    ret = 'runtimeContext.test(' + JSON.stringify((right).value) + ', [' + left.generateCode() + '])';
                } else if(right instanceof ParserNodeLiteral && (right).value === null) {
                    ret = 'runtimeContext.test("null", [' + left.generateCode() + '])';
                } else {
                    throw (new Error("ParserNodeBinaryOperation: Not implemented 'is' operator for tests with " + JSON.stringify(right)));
                }
                if(this.operator == 'is not') {
                    ret = '!(' + ret + ')';
                }
                return ret;
            default:
                return ('(' + this.left.generateCode() + ' ' + this.operator + ' ' + this.right.generateCode() + ')');
        }
    };
    return ParserNodeBinaryOperation;
})(ParserNodeExpression);
exports.ParserNodeBinaryOperation = ParserNodeBinaryOperation;
var ParserNodeTernaryOperation = (function (_super) {
    __extends(ParserNodeTernaryOperation, _super);
    function ParserNodeTernaryOperation(cond, exprTrue, exprFalse) {
        _super.call(this);
        this.cond = cond;
        this.exprTrue = exprTrue;
        this.exprFalse = exprFalse;
        this.type = 'ParserNodeTernaryOperation';
    }
    ParserNodeTernaryOperation.prototype.generateCode = function () {
        return ('(' + this.cond.generateCode() + " ? " + this.exprTrue.generateCode() + " : " + this.exprFalse.generateCode() + ')');
    };
    return ParserNodeTernaryOperation;
})(ParserNode);
exports.ParserNodeTernaryOperation = ParserNodeTernaryOperation;
var ParserNodeOutputText = (function (_super) {
    __extends(ParserNodeOutputText, _super);
    function ParserNodeOutputText(text) {
        _super.call(this);
        this.text = text;
        this.type = 'ParserNodeOutputText';
    }
    ParserNodeOutputText.prototype.generateCode = function () {
        return 'runtimeContext.write(' + JSON.stringify(this.text) + ');';
    };
    return ParserNodeOutputText;
})(ParserNode);
exports.ParserNodeOutputText = ParserNodeOutputText;
var ParserNodeOutputNodeExpression = (function (_super) {
    __extends(ParserNodeOutputNodeExpression, _super);
    function ParserNodeOutputNodeExpression(expression) {
        _super.call(this);
        this.expression = expression;
        this.type = 'ParserNodeOutputNodeExpression';
    }
    ParserNodeOutputNodeExpression.prototype.generateCode = function () {
        return 'runtimeContext.write(' + this.expression.generateCode() + ')';
    };
    return ParserNodeOutputNodeExpression;
})(ParserNodeExpression);
exports.ParserNodeOutputNodeExpression = ParserNodeOutputNodeExpression;
var ParserNodeReturnStatement = (function (_super) {
    __extends(ParserNodeReturnStatement, _super);
    function ParserNodeReturnStatement(expression) {
        _super.call(this);
        this.expression = expression;
        this.type = 'ParserNodeReturnStatement';
    }
    ParserNodeReturnStatement.prototype.generateCode = function () {
        return 'return ' + this.expression.generateCode() + ';';
    };
    return ParserNodeReturnStatement;
})(ParserNodeStatement);
exports.ParserNodeReturnStatement = ParserNodeReturnStatement;
