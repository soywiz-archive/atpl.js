var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ParserNode = (function () {
    function ParserNode() { }
    ParserNode.prototype.generateCode = function () {
        return '<invalid>';
    };
    ParserNode.prototype.optimize = function () {
        return this;
    };
    return ParserNode;
})();
exports.ParserNode = ParserNode;
var ParserNodeContainer = (function (_super) {
    __extends(ParserNodeContainer, _super);
    function ParserNodeContainer() {
        _super.apply(this, arguments);

        this.nodes = [];
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
var ParserNodeArrayContainer = (function (_super) {
    __extends(ParserNodeArrayContainer, _super);
    function ParserNodeArrayContainer() {
        _super.apply(this, arguments);

    }
    ParserNodeArrayContainer.prototype.generateCode = function () {
        var list = [];
        for(var n in this.nodes) {
            list.push(this.nodes[n].generateCode());
        }
        return '[' + list.join(', ') + ']';
    };
    return ParserNodeArrayContainer;
})(ParserNodeContainer);
exports.ParserNodeArrayContainer = ParserNodeArrayContainer;
var ParserNodeLiteral = (function (_super) {
    __extends(ParserNodeLiteral, _super);
    function ParserNodeLiteral(value) {
        _super.call(this);
        this.value = value;
    }
    ParserNodeLiteral.prototype.generateCode = function () {
        return JSON.stringify(this.value);
    };
    return ParserNodeLiteral;
})(ParserNode);
exports.ParserNodeLiteral = ParserNodeLiteral;
var ParserNodeIdentifier = (function (_super) {
    __extends(ParserNodeIdentifier, _super);
    function ParserNodeIdentifier(value) {
        _super.call(this);
        this.value = value;
    }
    ParserNodeIdentifier.prototype.generateCode = function () {
        return 'runtimeContext.scope.' + this.value;
    };
    return ParserNodeIdentifier;
})(ParserNode);
exports.ParserNodeIdentifier = ParserNodeIdentifier;
var ParserNodeUnaryOperation = (function (_super) {
    __extends(ParserNodeUnaryOperation, _super);
    function ParserNodeUnaryOperation(operation, right) {
        _super.call(this);
        this.operation = operation;
        this.right = right;
    }
    ParserNodeUnaryOperation.prototype.generateCode = function () {
        return this.operation + this.right.generateCode();
    };
    return ParserNodeUnaryOperation;
})(ParserNode);
exports.ParserNodeUnaryOperation = ParserNodeUnaryOperation;
var ParserNodeBinaryOperation = (function (_super) {
    __extends(ParserNodeBinaryOperation, _super);
    function ParserNodeBinaryOperation(operation, left, right) {
        _super.call(this);
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    ParserNodeBinaryOperation.prototype.generateCode = function () {
        return ('(' + this.left.generateCode() + ' ' + this.operation + ' ' + this.right.generateCode() + ')');
    };
    return ParserNodeBinaryOperation;
})(ParserNode);
exports.ParserNodeBinaryOperation = ParserNodeBinaryOperation;
var ParserNodeTernaryOperation = (function (_super) {
    __extends(ParserNodeTernaryOperation, _super);
    function ParserNodeTernaryOperation(cond, exprTrue, exprFalse) {
        _super.call(this);
        this.cond = cond;
        this.exprTrue = exprTrue;
        this.exprFalse = exprFalse;
    }
    ParserNodeTernaryOperation.prototype.generateCode = function () {
        return ('(' + this.cond.generateCode() + "? " + this.exprTrue.generateCode() + ": " + this.exprFalse.generateCode() + ')');
    };
    return ParserNodeTernaryOperation;
})(ParserNode);
exports.ParserNodeTernaryOperation = ParserNodeTernaryOperation;
var ParserNodeOutputText = (function (_super) {
    __extends(ParserNodeOutputText, _super);
    function ParserNodeOutputText(text) {
        _super.call(this);
        this.text = text;
    }
    ParserNodeOutputText.prototype.generateCode = function () {
        return 'runtimeContext.write(' + JSON.stringify(this.text) + ');';
    };
    return ParserNodeOutputText;
})(ParserNode);
exports.ParserNodeOutputText = ParserNodeOutputText;
