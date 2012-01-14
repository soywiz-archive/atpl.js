///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNode = function() {
};
exports.ParserNode.prototype.generateCode = function() {
	return '<invalid>';
};
exports.ParserNode.prototype.optimize = function() {
	return this;
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeContainer = function() {
	this.nodes = []; 
};
exports.ParserNodeContainer.prototype.__proto__ = exports.ParserNode.prototype;

exports.ParserNodeContainer.prototype.add = function(node) {
	this.nodes.push(node);
};
exports.ParserNodeContainer.prototype.generateCode = function() {
	var output = '';
	for (var n in this.nodes) {
		output += this.nodes[n].generateCode();
	}
	return output;
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeArrayContainer = function() {
	this.nodes = []; 
};
exports.ParserNodeArrayContainer.prototype.__proto__ = exports.ParserNodeContainer.prototype;

exports.ParserNodeArrayContainer.prototype.generateCode = function() {
	var list = [];
	for (var n in this.nodes) {
		list.push(this.nodes[n].generateCode());
	}
	return '[' + list.join(', ') + ']';
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeLiteral = function(value) {
	this.value = value;
};
exports.ParserNodeLiteral.prototype.__proto__ = exports.ParserNode.prototype;

exports.ParserNodeLiteral.prototype.generateCode = function() {
	return JSON.stringify(this.value);
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeIdentifier = function(value) {
	this.value = value;
};
exports.ParserNodeIdentifier.prototype.__proto__ = exports.ParserNode.prototype;

exports.ParserNodeIdentifier.prototype.generateCode = function() {
	return 'runtimeContext.scope.' + this.value;
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeUnaryOperation = function(operation, left) {
	this.operation = operation;
	this.left = left;
};
exports.ParserNodeUnaryOperation.prototype.__proto__ = exports.ParserNode.prototype;

exports.ParserNodeUnaryOperation.prototype.generateCode = function() {
	return this.operation + this.left.generateCode();
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeBinaryOperation = function(operation, left, right) {
	this.operation = operation;
	this.left = left;
	this.right = right;
};
exports.ParserNodeBinaryOperation.prototype.__proto__ = exports.ParserNode.prototype;

exports.ParserNodeBinaryOperation.prototype.generateCode = function() {
	return (
		'(' +
			this.left.generateCode() +
			' ' + this.operation  + ' ' +
			this.right.generateCode() +
		')'
	);
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

exports.ParserNodeOutputText = function(text) {
	this.text = text;
};
exports.ParserNodeOutputText.prototype.__proto__ = exports.ParserNode.prototype;

exports.ParserNodeOutputText.prototype.generateCode = function() {
	return 'runtimeContext.write(' + JSON.stringify(this.text) + ');';
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
