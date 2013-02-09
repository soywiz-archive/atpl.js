///<reference path='../imports.d.ts'/>

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//export class NodeBuilder {
//	binary(left: ParserNodeExpression, op: string, right: ParserNodeExpression): ParserNodeExpression {
//		if (op == '=') {
//			return new ParserNodeAssignment(left, right);
//		} else {
//			return new ParserNodeBinaryOperation(left, op, right);
//		}
//	}
//}

export export class ParserNode {
	type: string = '-';

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
	type: string = 'ParserNodeContainer';

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

export class ParserNodeObjectItem extends ParserNode {
	type: string = 'ParserNodeObjectItem';

	constructor(private key: ParserNodeExpression, private value: ParserNodeExpression) {
		super();
	}

	generateCode() {
		return this.key.generateCode() + ' : ' + this.value.generateCode();
	}
}

export class ParserNodeObjectContainer extends ParserNodeExpression {
	type: string = 'ParserNodeObjectContainer';

	constructor(private items: ParserNodeObjectItem[]) {
		super();
	}

	generateCode() {
		return '{' + this.items.map(node => node.generateCode()).join(', ') + '}';
	}
}

export class ParserNodeArrayContainer extends ParserNodeExpression {
	type: string = 'ParserNodeArrayContainer';

	constructor(private items: ParserNodeExpression[]) {
		super();
	}

	generateCode() {
		return '[' + this.items.map(node => node.generateCode()).join(', ') + ']';
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeLiteral extends ParserNodeExpression {
	type: string = 'ParserNodeLiteral';

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
	type: string = 'ParserNodeLeftValue';

	generateAssign(expr: ParserNodeExpression): string {
		throw (new Error("Must implement"));
	}
}

export class ParserNodeIdentifier extends ParserNodeLeftValue {
	type: string = 'ParserNodeIdentifier';

	constructor(public value: string) {
		super();
	}

	generateAssign(expr: ParserNodeExpression) {
		return 'runtimeContext.scopeSet(' + JSON.stringify(this.value) + ', ' + expr.generateCode() + ')';
	}

	generateCode() {
		return 'runtimeContext.scopeGet(' + JSON.stringify(this.value) + ')';
	}
}

export class ParserNodeStatement extends ParserNode {
	type: string = 'ParserNodeStatement';
}

export class ParserNodeRaw extends ParserNodeExpression {
	type: string = 'ParserNodeRaw';

	constructor(public value: string) {
		super();
	}

	generateCode() {
		return this.value;
	}
}

export class ParserNodeAssignment extends ParserNodeStatement {
	type: string = 'ParserNodeAssignment';

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
	type: string = 'ParserNodeCommaExpression';

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
	type: string = 'ParserNodeArrayAccess';

	constructor(public object: ParserNodeExpression, public key: ParserNodeExpression) {
		super();
	}

	generateCode() {
		return 'runtimeContext.access(' + this.object.generateCode() + ', ' + this.key.generateCode() + ')';
	}
}

export class ParserNodeArraySlice extends ParserNodeExpression {
	type: string = 'ParserNodeArraySlice';

	constructor(public object: ParserNodeExpression, public left: ParserNodeExpression, public right: ParserNodeExpression) {
		super();
	}

	generateCode() {
		return 'runtimeContext.slice(' + this.object.generateCode() + ', ' + this.left.generateCode() + ', ' + this.right.generateCode() + ')';
	}
}

export class ParserNodeFunctionCall extends ParserNodeExpression {
	type: string = 'ParserNodeFunctionCall';

	constructor(public functionExpr: ParserNodeExpression, public arguments: ParserNodeCommaExpression) {
		super();
	}

	generateCode() {
		if (this.functionExpr instanceof ParserNodeArrayAccess) {
			var arrayAccess = <ParserNodeArrayAccess>this.functionExpr;
			return 'runtimeContext.callContext(' + arrayAccess.object.generateCode() + ', ' + arrayAccess.key.generateCode() + ', [' + this.arguments.generateCode() + '])';
		} else {
			return 'runtimeContext.call(' + this.functionExpr.generateCode() + ', [' + this.arguments.generateCode() + '])';
		}
	}
}

export class ParserNodeFilterCall extends ParserNodeExpression {
	type: string = 'ParserNodeFilterCall';

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
	type: string = 'ParserNodeUnaryOperation';

	constructor(public operator: string, public right: ParserNode) {
		super();
	}

	generateCode() {
		switch (this.operator) {
			case 'not':
				return '!(' + this.right.generateCode() + ')';
			default:
				return this.operator + '(' + this.right.generateCode() + ')';
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeBinaryOperation extends ParserNode {
	type: string = 'ParserNodeBinaryOperation';

	constructor(public operator, public left, public right) {
		super();
	}

	generateCode() {
		switch (this.operator) {
			case '~':
				return '("" + ' + this.left.generateCode() + ' + ' + this.right.generateCode() + ')';
			case '..':
				return 'runtimeContext.range(' + this.left.generateCode() + ', ' + this.right.generateCode() + ')';
			case '?:':
				return 'runtimeContext.ternaryShortcut(' + this.left.generateCode() + ', ' + this.right.generateCode() + ')';
			case '**':
				return 'Math.pow(' + this.left.generateCode() + ',' + this.right.generateCode() + ')';
			case 'not in':
			case 'in':
				var ret = 'runtimeContext.inArray(' + this.left.generateCode() + ',' + this.right.generateCode() + ')';
				if ((this.operator == 'not in')) ret = '!(' + ret + ')';

				return ret;
			case 'is':
			case 'is not':
				var ret = '';
				var left = this.left;
				var right = this.right;

				if (this.right instanceof ParserNodeUnaryOperation) {
					right = this.right.right;
				}

				if (right instanceof ParserNodeFunctionCall) {
					//throw (new Error("Not implemented ParserNodeFunctionCall"));
					ret = 'runtimeContext.test(' + right.functionExpr.generateCode() + ', [' + left.generateCode() + ',' + right.arguments.generateCode() + '])';
				} else if (right instanceof ParserNodeIdentifier) {
					ret = 'runtimeContext.test(' + JSON.stringify(right.value) + ', [' + left.generateCode() + '])';
				} else {
					throw (new Error("ParserNodeBinaryOperation: Not implemented 'is' operator for tests with " + JSON.stringify(right)));
				}

				if (this.operator == 'is not') ret = '!(' + ret + ')';

				return ret;
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
	type: string = 'ParserNodeTernaryOperation';

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
	type: string = 'ParserNodeOutputText';

	constructor(public text) {
		super();
	}

	generateCode() {
		return 'runtimeContext.write(' + JSON.stringify(this.text) + ');';
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
