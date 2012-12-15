///<reference path='../imports.d.ts'/>

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export export class ParserNode {
	generateCode() {
		return '<invalid>';
	}

	optimize() {
		return this;
	}
}

export export class ParserNodeExpression extends ParserNode {
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeContainer extends ParserNode {
	nodes:ParserNode[] = [];

	add(node) {
		this.nodes.push(node);
	}

	generateCode() {
		var output = '';
		for (var n in this.nodes) {
			output += this.nodes[n].generateCode();
		}
		return output;
	}
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeArrayContainer extends ParserNodeExpression {
	constructor(private nodes: ParserNodeExpression[]) {
		super();
	}

	generateCode() {
		var list = [];
		for (var n in this.nodes) {
			list.push(this.nodes[n].generateCode());
		}
		return '[' + list.join(', ') + ']';
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeLiteral extends ParserNodeExpression {
	constructor(public value: any) {
		super();
	}

	generateCode() {
		return JSON.stringify(this.value);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeLeftValue extends ParserNodeExpression {
	generateAssign(expr: ParserNodeExpression) {
		throw (new Error("Must implement"));
		return "";
	}
}

export class ParserNodeIdentifier extends ParserNodeLeftValue {
	constructor(public value: string) {
		super();
	}

	generateAssign(expr: ParserNodeExpression) {
		return 'runtimeContext.scope.set(' + JSON.stringify(this.value) + ', ' + expr.generateCode() + ')';
	}

	generateCode() {
		return 'runtimeContext.scope.get(' + JSON.stringify(this.value) + ')';
	}
}

export class ParserNodeStatement extends ParserNode {
}

export class ParserNodeRaw extends ParserNodeExpression {
	constructor(public value: string) {
		super();
	}

	generateCode() {
		return this.value;
	}
}

export class ParserNodeAssignment extends ParserNodeStatement {
	constructor(public leftValue: ParserNodeLeftValue, public rightValue: ParserNodeExpression) {
		super();
	}

	generateCode() {
		return this.leftValue.generateAssign(this.rightValue);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeCommaExpression extends ParserNode {
	constructor(public expressions: ParserNodeExpression[]) {
		super();
	}

	generateCode() {
		return this.expressions.map((item) => item.generateCode()).join(', ');
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeArrayAccess extends ParserNodeExpression {
	constructor(public object: ParserNodeExpression, public key: ParserNodeExpression) {
		super();
	}

	generateCode() {
		return 'runtimeContext.access(' + this.object.generateCode() + ', ' + this.key.generateCode() + ')';
	}
}

export class ParserNodeFunctionCall extends ParserNodeExpression {
	constructor(public functionExpr: ParserNodeExpression, public arguments: ParserNodeCommaExpression) {
		super();
	}

	generateCode() {
		return 'runtimeContext.call(' + this.functionExpr.generateCode() + ', [' + this.arguments.generateCode() + '])';
	}
}

export class ParserNodeFilterCall extends ParserNodeExpression {
	constructor(public filterName: string, public arguments: ParserNodeCommaExpression) {
		super();
	}

	generateCode() {
		return 'runtimeContext.filter(' + JSON.stringify(this.filterName) + ', [' + this.arguments.generateCode() + '])';
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeUnaryOperation extends ParserNode {
	constructor(public operation: string, public right: ParserNode) {
		super();
	}

	generateCode() {
		return this.operation + this.right.generateCode();
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeBinaryOperation extends ParserNode {
	constructor(public operator, public left, public right) {
		super();
	}

	generateCode() {
		switch (this.operator) {
			case '**':
				return 'Math.pow(' + this.left.generateCode() + ',' + this.right.generateCode() + ')';
			case 'in':
				return 'runtimeContext.inArray(' + this.left.generateCode() + ',' + this.right.generateCode() + ')';
			case 'is':
				if (this.right instanceof ParserNodeFunctionCall) {
					//throw (new Error("Not implemented ParserNodeFunctionCall"));
					return 'runtimeContext.test(' + this.right.functionExpr.generateCode() + ', [' + this.left.generateCode() + ',' + this.right.arguments.generateCode() + '])';
				} else if (this.right instanceof ParserNodeIdentifier) {
					return 'runtimeContext.test(' + JSON.stringify(this.right.value) + ', [' + this.left.generateCode() + '])';
				} else {
					throw (new Error("Not implemented else"));
				}
			default:
				return (
					'(' +
						this.left.generateCode() +
						' ' + this.operator  + ' ' +
						this.right.generateCode() +
					')'
				);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeTernaryOperation extends ParserNode {
	constructor(public cond: ParserNode, public exprTrue: ParserNode, public exprFalse: ParserNode) {
		super();
	}

	generateCode() {
		return (
			'(' +
				this.cond.generateCode() + 
				" ? " + this.exprTrue.generateCode() +
				" : " + this.exprFalse.generateCode() +
			')'
		);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeOutputText extends ParserNode {
	constructor(public text) {
		super();
	}

	generateCode() {
		return 'runtimeContext.write(' + JSON.stringify(this.text) + ');';
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
